package repository

import (
	"database/sql"
	"fmt"

	"vehicle-commerce/backend/internal/domain"

	"github.com/google/uuid"
)

func (db *DB) CreateStockTransfer(req *domain.InterBranchTransferRequest, actorID string) (string, error) {
	if req.FromBranchID == req.ToBranchID {
		return "", fmt.Errorf("source and destination branch must be different")
	}
	if req.Quantity < 1 {
		return "", fmt.Errorf("quantity must be greater than zero")
	}
	id := uuid.New().String()
	result, err := db.Exec(`
		INSERT INTO stock_transfers (id, from_branch_id, to_branch_id, product_id, quantity, notes, requested_by_user_id)
		SELECT $1, $2, $3, p.id, $5, NULLIF($6, ''), NULLIF($7, '')::uuid
		FROM products p JOIN categories c ON c.id = p.category_id
		WHERE p.id = $4 AND c.type IN ('SPARE_PART', 'BICYCLE')`,
		id, req.FromBranchID, req.ToBranchID, req.ProductID, req.Quantity, req.Notes, actorID)
	if err != nil {
		return "", err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return "", err
	}
	if affected == 0 {
		return "", fmt.Errorf("only spare parts and bicycles can be transferred with quantity-based stock")
	}
	return id, nil
}

func (db *DB) GetStockTransfers(branchID string) ([]domain.StockTransfer, error) {
	query := `
		SELECT st.id, st.from_branch_id, fb.name, st.to_branch_id, tb.name,
		       st.product_id, p.name, st.quantity, st.status, COALESCE(st.notes, ''), st.requested_at
		FROM stock_transfers st
		JOIN branches fb ON fb.id = st.from_branch_id
		JOIN branches tb ON tb.id = st.to_branch_id
		JOIN products p ON p.id = st.product_id`
	args := []interface{}{}
	if branchID != "" {
		query += " WHERE st.from_branch_id = $1 OR st.to_branch_id = $1"
		args = append(args, branchID)
	}
	query += " ORDER BY st.requested_at DESC"
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	transfers := []domain.StockTransfer{}
	for rows.Next() {
		var transfer domain.StockTransfer
		if err := rows.Scan(
			&transfer.ID, &transfer.FromBranchID, &transfer.FromBranchName,
			&transfer.ToBranchID, &transfer.ToBranchName, &transfer.ProductID,
			&transfer.ProductName, &transfer.Quantity, &transfer.Status,
			&transfer.Notes, &transfer.RequestedAt,
		); err != nil {
			return nil, err
		}
		transfers = append(transfers, transfer)
	}
	return transfers, rows.Err()
}

func (db *DB) UpdateStockTransfer(id, action, branchID, actorID string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var transfer domain.StockTransfer
	err = tx.QueryRow(`
		SELECT from_branch_id, to_branch_id, product_id, quantity, status
		FROM stock_transfers WHERE id = $1 FOR UPDATE`, id).
		Scan(&transfer.FromBranchID, &transfer.ToBranchID, &transfer.ProductID, &transfer.Quantity, &transfer.Status)
	if err != nil {
		return err
	}

	switch action {
	case "approve":
		if transfer.Status != "PENDING" || (branchID != "" && transfer.FromBranchID != branchID) {
			return sql.ErrNoRows
		}
		result, err := tx.Exec(`
			UPDATE branch_inventory
			SET quantity = quantity - $1, updated_at = NOW()
			WHERE branch_id = $2 AND product_id = $3 AND quantity >= $1`,
			transfer.Quantity, transfer.FromBranchID, transfer.ProductID)
		if err != nil {
			return err
		}
		affected, err := result.RowsAffected()
		if err != nil {
			return err
		}
		if affected == 0 {
			return fmt.Errorf("insufficient available stock to approve transfer")
		}
		_, err = tx.Exec(`
			UPDATE stock_transfers
			SET status = 'IN_TRANSIT', approved_by_user_id = NULLIF($1, '')::uuid, approved_at = NOW()
			WHERE id = $2`, actorID, id)
		if err != nil {
			return err
		}
		if err := addStockMovement(tx, transfer.FromBranchID, transfer.ProductID, id, "TRANSFER_OUT", -transfer.Quantity, actorID); err != nil {
			return err
		}
	case "receive":
		if transfer.Status != "IN_TRANSIT" || (branchID != "" && transfer.ToBranchID != branchID) {
			return sql.ErrNoRows
		}
		_, err := tx.Exec(`
			INSERT INTO branch_inventory (id, branch_id, product_id, quantity, reserved_qty, min_threshold, selling_price, updated_at)
			VALUES ($1, $2, $3, $4, 0, 3, (SELECT base_price FROM products WHERE id = $3), NOW())
			ON CONFLICT (branch_id, product_id)
			DO UPDATE SET quantity = branch_inventory.quantity + EXCLUDED.quantity, updated_at = NOW()`,
			uuid.New().String(), transfer.ToBranchID, transfer.ProductID, transfer.Quantity)
		if err != nil {
			return err
		}
		_, err = tx.Exec(`
			UPDATE stock_transfers
			SET status = 'COMPLETED', received_by_user_id = NULLIF($1, '')::uuid, received_at = NOW()
			WHERE id = $2`, actorID, id)
		if err != nil {
			return err
		}
		if err := addStockMovement(tx, transfer.ToBranchID, transfer.ProductID, id, "TRANSFER_IN", transfer.Quantity, actorID); err != nil {
			return err
		}
	case "reject":
		if transfer.Status != "PENDING" || (branchID != "" && transfer.FromBranchID != branchID) {
			return sql.ErrNoRows
		}
		if _, err := tx.Exec(`
			UPDATE stock_transfers SET status = 'REJECTED', approved_by_user_id = NULLIF($1, '')::uuid, approved_at = NOW()
			WHERE id = $2`, actorID, id); err != nil {
			return err
		}
	default:
		return fmt.Errorf("unknown stock transfer action")
	}
	return tx.Commit()
}

func (db *DB) AddBranchStock(branchID, productID string, quantity, threshold int, actorID string) error {
	if quantity < 1 || threshold < 0 {
		return fmt.Errorf("quantity must be positive and threshold cannot be negative")
	}
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO branch_inventory (id, branch_id, product_id, quantity, reserved_qty, min_threshold, selling_price, updated_at)
		SELECT $1, $2, p.id, $4, 0, $5, p.base_price, NOW()
		FROM products p JOIN categories c ON c.id = p.category_id
		WHERE p.id = $3 AND c.type IN ('SPARE_PART', 'BICYCLE')
		ON CONFLICT (branch_id, product_id)
		DO UPDATE SET quantity = branch_inventory.quantity + EXCLUDED.quantity,
		              min_threshold = EXCLUDED.min_threshold, updated_at = NOW()`,
		uuid.New().String(), branchID, productID, quantity, threshold)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return fmt.Errorf("only spare parts and bicycles can use quantity-based stock")
	}
	if err := addStockMovement(tx, branchID, productID, "", "STOCK_IN", quantity, actorID); err != nil {
		return err
	}
	return tx.Commit()
}

func (db *DB) CreateVehicleItem(req *domain.CreateVehicleItemRequest, actorID string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	vehicleID := uuid.New().String()
	result, err := tx.Exec(`
		INSERT INTO vehicle_items
			(id, product_id, branch_id, vin, engine_no, color, mileage_km, plate_number, cost_price, selling_price, status)
		SELECT $1, p.id, $2, $3, NULLIF($4, ''), $5, $6, NULLIF($7, ''), $8, $9, 'AVAILABLE'
		FROM products p JOIN categories c ON c.id = p.category_id
		WHERE p.id = $10 AND c.type IN ('GASOLINE_VEHICLE', 'ELECTRIC_VEHICLE')`,
		vehicleID, req.BranchID, req.VIN, req.EngineNo, req.Color, req.MileageKM,
		req.PlateNumber, req.CostPrice, req.SellingPrice, req.ProductID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return fmt.Errorf("selected product is not a vehicle")
	}
	if err := addStockMovement(tx, req.BranchID, req.ProductID, "", "STOCK_IN", 1, actorID); err != nil {
		return err
	}
	return tx.Commit()
}

func (db *DB) GetStockMovements(branchID, fromDate, toDate string) ([]domain.StockMovement, error) {
	query := `
		SELECT sm.id, sm.branch_id, b.name, sm.product_id, p.name, sm.transaction_type,
		       sm.quantity, COALESCE(u.full_name, 'System'), sm.created_at
		FROM stock_movements sm
		JOIN branches b ON b.id = sm.branch_id
		JOIN products p ON p.id = sm.product_id
		LEFT JOIN users u ON u.id = sm.performed_by_user_id
		WHERE ($1 = '' OR sm.branch_id = $1)
		  AND ($2 = '' OR sm.created_at >= $2::date)
		  AND ($3 = '' OR sm.created_at < ($3::date + INTERVAL '1 day'))
		ORDER BY sm.created_at DESC
		LIMIT 1000`
	rows, err := db.Query(query, branchID, fromDate, toDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	movements := []domain.StockMovement{}
	for rows.Next() {
		var movement domain.StockMovement
		if err := rows.Scan(
			&movement.ID, &movement.BranchID, &movement.BranchName,
			&movement.ProductID, &movement.ProductName, &movement.TransactionType,
			&movement.Quantity, &movement.PerformedBy, &movement.CreatedAt,
		); err != nil {
			return nil, err
		}
		movements = append(movements, movement)
	}
	return movements, rows.Err()
}

func addStockMovement(tx *sql.Tx, branchID, productID, transferID, movementType string, quantity int, actorID string) error {
	_, err := tx.Exec(`
		INSERT INTO stock_movements (id, branch_id, product_id, transfer_id, transaction_type, quantity, performed_by_user_id)
		VALUES ($1, $2, $3, NULLIF($4, '')::uuid, $5, $6, NULLIF($7, '')::uuid)`,
		uuid.New().String(), branchID, productID, transferID, movementType, quantity, actorID)
	return err
}

func (db *DB) RecordInstallmentPayment(scheduleID, branchID, actorID string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var scheduleBranchID string
	err = tx.QueryRow(`
		SELECT ia.branch_id
		FROM installment_payment_schedules ps
		JOIN installment_applications ia ON ia.id = ps.installment_application_id
		WHERE ps.id = $1 AND ps.status IN ('PENDING', 'OVERDUE')
		FOR UPDATE OF ps`, scheduleID).Scan(&scheduleBranchID)
	if err != nil {
		return err
	}
	if branchID != "" && branchID != scheduleBranchID {
		return sql.ErrNoRows
	}
	result, err := tx.Exec(`
		UPDATE installment_payment_schedules SET status = 'PAID', paid_at = NOW()
		WHERE id = $1 AND status IN ('PENDING', 'OVERDUE')`, scheduleID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	_, err = tx.Exec(`
		INSERT INTO audit_logs (id, user_id, branch_id, action, entity_name, entity_id, created_at)
		VALUES ($1, NULLIF($2, '')::uuid, $3, 'INSTALLMENT_PAYMENT_RECORDED', 'installment_payment_schedules', $4, NOW())`,
		uuid.New().String(), actorID, scheduleBranchID, scheduleID)
	if err != nil {
		return err
	}
	return tx.Commit()
}
