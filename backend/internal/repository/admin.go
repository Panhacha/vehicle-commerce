package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"vehicle-commerce/backend/internal/domain"

	"github.com/google/uuid"
)

func (db *DB) GetAdminUsers() ([]domain.User, error) {
	rows, err := db.Query(`
		SELECT id, branch_id, username, email, full_name, COALESCE(phone, ''), role, status, created_at
		FROM users WHERE role <> 'CUSTOMER'
		ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []domain.User{}
	for rows.Next() {
		var user domain.User
		if err := rows.Scan(
			&user.ID, &user.BranchID, &user.Username, &user.Email, &user.FullName,
			&user.Phone, &user.Role, &user.Status, &user.CreatedAt,
		); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (db *DB) CreateAdminUser(req *domain.CreateUserRequest, passwordHash string) (*domain.User, error) {
	user := &domain.User{
		ID:       uuid.New().String(),
		Username: strings.TrimSpace(req.Username),
		Email:    strings.TrimSpace(req.Email),
		FullName: strings.TrimSpace(req.FullName),
		Phone:    strings.TrimSpace(req.Phone),
		Role:     req.Role,
		Status:   "ACTIVE",
	}
	if req.BranchID != "" {
		user.BranchID = &req.BranchID
	}
	err := db.QueryRow(`
		INSERT INTO users (id, branch_id, username, email, password_hash, full_name, phone, role, status)
		VALUES ($1, NULLIF($2, '')::uuid, $3, $4, $5, $6, NULLIF($7, ''), $8, 'ACTIVE')
		RETURNING created_at`,
		user.ID, req.BranchID, user.Username, user.Email, passwordHash, user.FullName, user.Phone, user.Role,
	).Scan(&user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (db *DB) UpdateAdminUser(id, actorID string, req *domain.UpdateUserRequest) error {
	if id == actorID {
		return fmt.Errorf("you cannot change your own role or disable your account")
	}
	result, err := db.Exec(`
		UPDATE users SET branch_id = NULLIF($1, '')::uuid, role = $2, status = $3, updated_at = NOW()
		WHERE id = $4 AND role <> 'CUSTOMER'`,
		req.BranchID, req.Role, req.Status, id)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (db *DB) GetInstallmentSchedules(branchID, status string) ([]domain.InstallmentPaymentSchedule, error) {
	if _, err := db.Exec(`
		UPDATE installment_payment_schedules
		SET status = 'OVERDUE'
		WHERE status = 'PENDING' AND due_date < CURRENT_DATE`); err != nil {
		return nil, err
	}
	query := `
		SELECT ps.id, ps.customer_id, c.full_name, o.order_no, ia.branch_id, b.name,
		       ps.due_date, ps.amount, ps.status,
		       CASE WHEN ps.status = 'PAID' OR ps.due_date >= CURRENT_DATE THEN 0
		            ELSE CURRENT_DATE - ps.due_date END,
		       ps.paid_at
		FROM installment_payment_schedules ps
		JOIN installment_applications ia ON ia.id = ps.installment_application_id
		JOIN customers c ON c.id = ps.customer_id
		JOIN orders o ON o.id = ia.order_id
		JOIN branches b ON b.id = ia.branch_id
		WHERE ($1 = '' OR ia.branch_id = $1)
		  AND ($2 = '' OR ps.status = $2)
		ORDER BY ps.due_date ASC`
	rows, err := db.Query(query, branchID, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	schedules := []domain.InstallmentPaymentSchedule{}
	for rows.Next() {
		var schedule domain.InstallmentPaymentSchedule
		if err := rows.Scan(
			&schedule.ID, &schedule.CustomerID, &schedule.CustomerName, &schedule.OrderNo,
			&schedule.BranchID, &schedule.BranchName, &schedule.DueDate, &schedule.Amount,
			&schedule.Status, &schedule.OverdueDays, &schedule.PaidAt,
		); err != nil {
			return nil, err
		}
		schedules = append(schedules, schedule)
	}
	return schedules, rows.Err()
}

func (db *DB) GetInstallmentScheduleByID(id, branchID string) (*domain.InstallmentPaymentSchedule, error) {
	var schedule domain.InstallmentPaymentSchedule
	err := db.QueryRow(`
		SELECT ps.id, ps.customer_id, c.full_name, o.order_no, ia.branch_id, b.name,
		       ps.due_date, ps.amount, ps.status,
		       CASE WHEN ps.status = 'PAID' OR ps.due_date >= CURRENT_DATE THEN 0
		            ELSE CURRENT_DATE - ps.due_date END,
		       ps.paid_at
		FROM installment_payment_schedules ps
		JOIN installment_applications ia ON ia.id = ps.installment_application_id
		JOIN customers c ON c.id = ps.customer_id
		JOIN orders o ON o.id = ia.order_id
		JOIN branches b ON b.id = ia.branch_id
		WHERE ps.id = $1 AND ($2 = '' OR ia.branch_id = $2)`,
		id, branchID,
	).Scan(
		&schedule.ID, &schedule.CustomerID, &schedule.CustomerName, &schedule.OrderNo,
		&schedule.BranchID, &schedule.BranchName, &schedule.DueDate, &schedule.Amount,
		&schedule.Status, &schedule.OverdueDays, &schedule.PaidAt,
	)
	if err != nil {
		return nil, err
	}
	return &schedule, nil
}

func (db *DB) CreateNotificationLog(eventType, target, payload, status, message string) error {
	_, err := db.Exec(`
		INSERT INTO notification_logs (id, event_type, target_channel, message_payload, delivery_status, error_message)
		VALUES ($1, $2, NULLIF($3, ''), $4, $5, NULLIF($6, ''))`,
		uuid.New().String(), eventType, target, payload, status, message)
	return err
}

func (db *DB) GetFailedNotification(id string) (*domain.NotificationLog, error) {
	var entry domain.NotificationLog
	err := db.QueryRow(`
		SELECT id, event_type, COALESCE(target_channel, ''), message_payload,
		       delivery_status, COALESCE(error_message, ''), created_at
		FROM notification_logs WHERE id = $1 AND delivery_status = 'FAILED'`, id).Scan(
		&entry.ID, &entry.EventType, &entry.TargetChannel, &entry.MessagePayload,
		&entry.DeliveryStatus, &entry.ErrorMessage, &entry.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &entry, nil
}

func (db *DB) UpdateNotificationLog(id, status, message string) error {
	result, err := db.Exec(`
		UPDATE notification_logs SET delivery_status = $1, error_message = NULLIF($2, '')
		WHERE id = $3`, status, message, id)
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
	return nil
}

func (db *DB) ClearNotificationLogs() error {
	_, err := db.Exec(`DELETE FROM notification_logs`)
	return err
}

func (db *DB) GetNotificationLogs(limit int) ([]domain.NotificationLog, error) {
	if limit < 1 || limit > 500 {
		limit = 100
	}
	rows, err := db.Query(`
		SELECT id, event_type, COALESCE(target_channel, ''), message_payload,
		       delivery_status, COALESCE(error_message, ''), created_at
		FROM notification_logs ORDER BY created_at DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := []domain.NotificationLog{}
	for rows.Next() {
		var entry domain.NotificationLog
		if err := rows.Scan(
			&entry.ID, &entry.EventType, &entry.TargetChannel, &entry.MessagePayload,
			&entry.DeliveryStatus, &entry.ErrorMessage, &entry.CreatedAt,
		); err != nil {
			return nil, err
		}
		logs = append(logs, entry)
	}
	return logs, rows.Err()
}
