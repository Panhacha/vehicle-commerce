package usecase

import (
	"fmt"
	"log"
	"math"
	"strings"
	"time"

	"vehicle-commerce/backend/internal/config"
	"vehicle-commerce/backend/internal/domain"
	"vehicle-commerce/backend/internal/repository"
	"vehicle-commerce/backend/internal/telegram"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *repository.DB
	bot  *telegram.BotService
	cfg  *config.Config
}

func NewService(repo *repository.DB, bot *telegram.BotService, cfg *config.Config) *Service {
	return &Service{
		repo: repo,
		bot:  bot,
		cfg:  cfg,
	}
}

// 1. Auth & JWT
func (s *Service) Login(username, password string) (*domain.LoginResponse, error) {
	user, err := s.repo.GetUserByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if user.Status != "ACTIVE" {
		return nil, fmt.Errorf("account is disabled")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &domain.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *Service) RegisterCustomer(req *domain.CustomerRegisterRequest) (*domain.LoginResponse, error) {
	if strings.TrimSpace(req.FullName) == "" {
		return nil, fmt.Errorf("សូមបញ្ចូលឈ្មោះពេញ (Full name is required)")
	}
	if strings.TrimSpace(req.Phone) == "" {
		return nil, fmt.Errorf("សូមបញ្ចូលលេខទូរស័ព្ទ (Phone number is required)")
	}
	if len(req.Password) < 4 {
		return nil, fmt.Errorf("លេខសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៤ តួអក្សរ (Password must be at least 4 characters)")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user, err := s.repo.RegisterCustomer(req, string(hash))
	if err != nil {
		return nil, err
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &domain.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *Service) GenerateToken(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":       user.ID,
		"username":  user.Username,
		"email":     user.Email,
		"role":      user.Role,
		"branch_id": user.BranchID,
		"exp":       time.Now().Add(72 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

// 2. Financial & Installment Loan Calculator
func (s *Service) CalculateInstallment(req domain.LoanCalculationRequest) domain.LoanCalculationResponse {
	if req.DownPayment <= 0 {
		req.DownPayment = req.VehiclePrice * 0.20 // Default 20% down payment
	}
	if req.InterestRate <= 0 {
		req.InterestRate = 8.5 // Default 8.5% annual rate
	}
	if req.TermMonths <= 0 {
		req.TermMonths = 36 // Default 36 months (3 years)
	}

	loanAmount := req.VehiclePrice - req.DownPayment
	if loanAmount <= 0 {
		return domain.LoanCalculationResponse{
			VehiclePrice:          req.VehiclePrice,
			DownPayment:           req.DownPayment,
			DownPaymentPercentage: (req.DownPayment / req.VehiclePrice) * 100,
			LoanAmount:            0,
			InterestRateAnnual:    req.InterestRate,
			TermMonths:            req.TermMonths,
			MonthlyPayment:        0,
			TotalInterest:         0,
			TotalRepayment:        req.DownPayment,
		}
	}

	downPct := (req.DownPayment / req.VehiclePrice) * 100
	monthlyRate := (req.InterestRate / 100.0) / 12.0

	// Amortization Formula: P * [ r(1 + r)^n ] / [ (1 + r)^n – 1]
	factor := math.Pow(1.0+monthlyRate, float64(req.TermMonths))
	monthlyPayment := loanAmount * (monthlyRate * factor) / (factor - 1.0)
	totalRepayment := (monthlyPayment * float64(req.TermMonths)) + req.DownPayment
	totalInterest := (monthlyPayment * float64(req.TermMonths)) - loanAmount

	return domain.LoanCalculationResponse{
		VehiclePrice:          math.Round(req.VehiclePrice*100) / 100,
		DownPayment:           math.Round(req.DownPayment*100) / 100,
		DownPaymentPercentage: math.Round(downPct*10) / 10,
		LoanAmount:            math.Round(loanAmount*100) / 100,
		InterestRateAnnual:    req.InterestRate,
		TermMonths:            req.TermMonths,
		MonthlyPayment:        math.Round(monthlyPayment*100) / 100,
		TotalInterest:         math.Round(totalInterest*100) / 100,
		TotalRepayment:        math.Round(totalRepayment*100) / 100,
	}
}

// 3. Orders & Checkout
func (s *Service) PlaceOrder(req *domain.CreateOrderRequest) (*domain.Order, error) {
	// Calculate subtotal
	var total float64
	for _, it := range req.Items {
		prod, err := s.repo.GetProductByID(it.ProductID)
		if err != nil {
			return nil, fmt.Errorf("product %s not found", it.ProductID)
		}
		qty := it.Quantity
		if qty <= 0 {
			qty = 1
		}
		total += prod.BasePrice * float64(qty)
	}

	order, err := s.repo.CreateOrder(req, total)
	if err != nil {
		return nil, err
	}

	// Trigger Telegram notification
	var branchName string = "Branch"
	branches, _ := s.repo.GetBranches()
	for _, b := range branches {
		if b.ID == req.BranchID {
			branchName = b.Name
			break
		}
	}
	s.logNotification("NEW_ORDER", order.OrderNo, s.bot.NotifyNewOrder(order, branchName))

	return order, nil
}

// 4. Trade-In Submission
func (s *Service) SubmitTradeIn(req *domain.TradeInRequest) (*domain.TradeInRequest, error) {
	// Auto compute initial estimated price if not specified
	if req.CustomerExpectedPrice <= 0 {
		req.CustomerExpectedPrice = 15000.00
	}

	err := s.repo.CreateTradeInRequest(req)
	if err != nil {
		return nil, err
	}

	// Notify staff via Telegram
	s.logNotification("NEW_TRADE_IN_REQUEST", req.ID, s.bot.NotifyTradeInSubmission(req))

	return req, nil
}

// 4.1 Installment Loan Application Submission
func (s *Service) SubmitInstallmentApplication(app *domain.InstallmentApplication, customerName, customerPhone, vehicleProductID string) (*domain.InstallmentApplication, error) {
	if app.VehiclePrice <= 0 {
		app.VehiclePrice = 35000.00
	}
	if app.DownPaymentPercentage <= 0 {
		app.DownPaymentPercentage = 20.0
	}
	if app.DownPayment <= 0 {
		app.DownPayment = app.VehiclePrice * (app.DownPaymentPercentage / 100.0)
	}
	if app.LoanAmount <= 0 {
		app.LoanAmount = app.VehiclePrice - app.DownPayment
	}
	if app.InterestRateAnnual <= 0 {
		app.InterestRateAnnual = 8.5
	}
	if app.TermMonths <= 0 {
		app.TermMonths = 36
	}
	if app.MonthlyInstallment <= 0 {
		r := (app.InterestRateAnnual / 100.0) / 12.0
		n := float64(app.TermMonths)
		if r > 0 {
			factor := math.Pow(1.0+r, n)
			app.MonthlyInstallment = math.Round((app.LoanAmount * (r * factor) / (factor - 1.0)) * 100) / 100
		} else {
			app.MonthlyInstallment = math.Round((app.LoanAmount / n) * 100) / 100
		}
	}

	err := s.repo.CreateInstallmentApp(app, customerName, customerPhone, vehicleProductID)
	if err != nil {
		return nil, err
	}

	// Notify staff via Telegram
	s.logNotification("NEW_INSTALLMENT_APPLICATION", app.ID, s.bot.NotifyLoanApplication(app))

	return app, nil
}

// 5. Inter-Branch Transfer
func (s *Service) InterBranchTransfer(req *domain.InterBranchTransferRequest) error {
	err := s.repo.TransferInventory(req)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) CreateStockTransfer(req *domain.InterBranchTransferRequest, actorID string) (string, error) {
	return s.repo.CreateStockTransfer(req, actorID)
}

func (s *Service) GetStockTransfers(branchID string) ([]domain.StockTransfer, error) {
	return s.repo.GetStockTransfers(branchID)
}

func (s *Service) UpdateStockTransfer(id, action, branchID, actorID string) error {
	return s.repo.UpdateStockTransfer(id, action, branchID, actorID)
}

func (s *Service) AddBranchStock(branchID, productID string, quantity, threshold int, actorID string) error {
	return s.repo.AddBranchStock(branchID, productID, quantity, threshold, actorID)
}

func (s *Service) CreateVehicleItem(req *domain.CreateVehicleItemRequest, actorID string) error {
	return s.repo.CreateVehicleItem(req, actorID)
}

func (s *Service) GetStockMovements(branchID, fromDate, toDate string) ([]domain.StockMovement, error) {
	return s.repo.GetStockMovements(branchID, fromDate, toDate)
}

func (s *Service) GetInstallmentSchedules(branchID, status string) ([]domain.InstallmentPaymentSchedule, error) {
	return s.repo.GetInstallmentSchedules(branchID, status)
}

func (s *Service) RecordInstallmentPayment(scheduleID, branchID, actorID string) error {
	return s.repo.RecordInstallmentPayment(scheduleID, branchID, actorID)
}

func (s *Service) SendInstallmentReminder(scheduleID, branchID string) error {
	schedule, err := s.repo.GetInstallmentScheduleByID(scheduleID, branchID)
	if err != nil {
		return err
	}
	message := fmt.Sprintf(
		"Payment reminder for %s: invoice %s has a monthly payment of $%.2f due on %s.",
		schedule.CustomerName,
		schedule.OrderNo,
		schedule.Amount,
		schedule.DueDate.Format("2006-01-02"),
	)
	sendErr := s.bot.SendTestMessage(message)
	s.logNotification("LOAN_PAYMENT_REMINDER", schedule.ID, sendErr)
	return sendErr
}

func (s *Service) GetAdminUsers() ([]domain.User, error) {
	return s.repo.GetAdminUsers()
}

func (s *Service) GetUserByID(id string) (*domain.User, error) {
	return s.repo.GetUserByID(id)
}

func (s *Service) CreateAdminUser(req *domain.CreateUserRequest) (*domain.User, error) {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	return s.repo.CreateAdminUser(req, string(passwordHash))
}

func (s *Service) UpdateAdminUser(id, actorID string, req *domain.UpdateUserRequest) error {
	var passwordHash string
	if strings.TrimSpace(req.Password) != "" {
		if len(req.Password) < 8 {
			return fmt.Errorf("password must be at least 8 characters")
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		passwordHash = string(hash)
	}
	return s.repo.UpdateAdminUser(id, actorID, req, passwordHash)
}

func (s *Service) DeleteAdminUser(id, actorID string) error {
	return s.repo.DeleteAdminUser(id, actorID)
}

// Pass-through getters
func (s *Service) GetBranches() ([]domain.Branch, error) {
	return s.repo.GetBranches()
}

func (s *Service) GetCategories() ([]domain.Category, error) {
	return s.repo.GetCategories()
}

func (s *Service) GetProducts(catSlug, search string) ([]domain.Product, error) {
	return s.repo.GetProducts(catSlug, search)
}

func (s *Service) GetProduct(id string) (*domain.Product, error) {
	return s.repo.GetProductByID(id)
}

func (s *Service) GetVehicleItems(prodID, branchID string) ([]domain.VehicleItem, error) {
	return s.repo.GetVehicleItems(prodID, branchID)
}

func (s *Service) GetBranchInventory(branchID string) ([]domain.BranchInventory, error) {
	return s.repo.GetBranchInventory(branchID)
}

func (s *Service) GetOrders(branchID, status string) ([]domain.Order, error) {
	return s.repo.GetOrders(branchID, status)
}

func (s *Service) GetOrderByReference(reference, branchID string) (*domain.Order, error) {
	return s.repo.GetOrderByReference(reference, branchID)
}

func (s *Service) UpdateOrderStatus(id, status, branchID, actorID string) error {
	return s.repo.UpdateOrderStatus(id, status, branchID, actorID)
}

func (s *Service) RecordOrderPayment(id string, amount float64, method, reference, notes, branchID, actorID string) error {
	return s.repo.RecordOrderPayment(id, amount, method, reference, notes, branchID, actorID)
}

func (s *Service) GetTradeInRequests(branchID string) ([]domain.TradeInRequest, error) {
	return s.repo.GetTradeInRequests(branchID)
}

func (s *Service) UpdateTradeInAppraisal(id string, amount float64, notes, status, branchID, reviewerID string) error {
	return s.repo.UpdateTradeInAppraisal(id, amount, notes, status, branchID, reviewerID)
}

func (s *Service) GetInstallmentApps(branchID string) ([]domain.InstallmentApplication, error) {
	return s.repo.GetInstallmentApps(branchID)
}

func (s *Service) UpdateInstallmentStatus(id, status, notes, branchID, reviewerID string) error {
	return s.repo.UpdateInstallmentStatus(id, status, notes, branchID, reviewerID)
}

func (s *Service) GetTelegramStatus() (telegram.Status, error) {
	return s.bot.GetStatus()
}

func (s *Service) SendTelegramTest(message string) error {
	sendErr := s.bot.SendTestMessage(message)
	status := "SENT"
	errorMessage := ""
	if sendErr != nil {
		status = "FAILED"
		errorMessage = sendErr.Error()
	}
	if err := s.repo.CreateNotificationLog("TEST_MESSAGE", s.cfg.TelegramChatID, message, status, errorMessage); err != nil {
		if sendErr != nil {
			return fmt.Errorf("telegram delivery failed: %v; could not save notification log: %w", sendErr, err)
		}
		return fmt.Errorf("telegram message sent but notification log could not be saved: %w", err)
	}
	return sendErr
}

func (s *Service) logNotification(eventType, payload string, sendErr error) {
	status := "SENT"
	errorMessage := ""
	if s.cfg.TelegramToken == "" {
		status = "MOCKED"
	} else if sendErr != nil {
		status = "FAILED"
		errorMessage = sendErr.Error()
	}
	if err := s.repo.CreateNotificationLog(eventType, s.cfg.TelegramChatID, payload, status, errorMessage); err != nil {
		log.Printf("[Notification Log Error] Could not store %s: %v", eventType, err)
	}
}

func (s *Service) GetNotificationLogs(limit int) ([]domain.NotificationLog, error) {
	return s.repo.GetNotificationLogs(limit)
}

func (s *Service) ResendNotification(id string) error {
	entry, err := s.repo.GetFailedNotification(id)
	if err != nil {
		return err
	}
	err = s.bot.SendTestMessage(entry.MessagePayload)
	status := "SENT"
	errorMessage := ""
	if err != nil {
		status = "FAILED"
		errorMessage = err.Error()
	}
	if logErr := s.repo.UpdateNotificationLog(id, status, errorMessage); logErr != nil {
		return fmt.Errorf("notification send result could not be saved: %w", logErr)
	}
	return err
}

func (s *Service) ClearNotificationLogs() error {
	return s.repo.ClearNotificationLogs()
}
