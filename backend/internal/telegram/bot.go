package telegram

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"vehicle-commerce/backend/internal/domain"
)

type BotService struct {
	token       string
	alertChatID string
	client      *http.Client
}

type Status struct {
	BotUsername      string `json:"bot_username"`
	ConnectionStatus string `json:"connection_status"`
	ActiveChatGroups int    `json:"active_chat_groups"`
	LastPingTime     string `json:"last_ping_time,omitempty"`
}

func NewBotService(token, alertChatID string) *BotService {
	return &BotService{
		token:       token,
		alertChatID: alertChatID,
		client:      &http.Client{Timeout: 10 * time.Second},
	}
}

type sendMessagePayload struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode"`
}

func (b *BotService) SendMessage(chatID, text string) error {
	if b.token == "" {
		log.Printf("[Telegram Bot Mock] ChatID: %s | Message:\n%s", chatID, text)
		return nil
	}

	targetChat := chatID
	if targetChat == "" {
		targetChat = b.alertChatID
	}
	if targetChat == "" {
		return fmt.Errorf("Telegram target chat ID is not configured")
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", b.token)
	payload := sendMessagePayload{
		ChatID:    targetChat,
		Text:      text,
		ParseMode: "Markdown",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := b.client.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("[Telegram Error] Failed to send message: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Printf("[Telegram Warning] Status code: %d", resp.StatusCode)
		return fmt.Errorf("telegram API returned status %d", resp.StatusCode)
	}
	return nil
}

func (b *BotService) GetStatus() (Status, error) {
	if b.token == "" {
		return Status{ConnectionStatus: "NOT_CONFIGURED"}, nil
	}

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("https://api.telegram.org/bot%s/getMe", b.token), nil)
	if err != nil {
		return Status{}, err
	}
	resp, err := b.client.Do(req)
	if err != nil {
		return Status{ConnectionStatus: "DISCONNECTED"}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= http.StatusBadRequest {
		return Status{ConnectionStatus: "DISCONNECTED"}, fmt.Errorf("telegram API returned status %d", resp.StatusCode)
	}

	var result struct {
		OK     bool `json:"ok"`
		Result struct {
			Username string `json:"username"`
		} `json:"result"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return Status{ConnectionStatus: "DISCONNECTED"}, err
	}
	if !result.OK {
		return Status{ConnectionStatus: "DISCONNECTED"}, fmt.Errorf("telegram rejected the bot status request")
	}

	activeGroups := 0
	if b.alertChatID != "" {
		activeGroups = 1
	}
	return Status{
		BotUsername:      result.Result.Username,
		ConnectionStatus: "CONNECTED",
		ActiveChatGroups: activeGroups,
		LastPingTime:     time.Now().UTC().Format(time.RFC3339),
	}, nil
}

func (b *BotService) SendTestMessage(text string) error {
	if b.token == "" {
		return fmt.Errorf("Telegram bot token is not configured")
	}
	if b.alertChatID == "" {
		return fmt.Errorf("Telegram alert chat ID is not configured")
	}
	return b.SendMessage(b.alertChatID, text)
}

func (b *BotService) NotifyNewOrder(order *domain.Order, branchName string) error {
	msg := fmt.Sprintf(
		"🚗 *NEW ORDER RECEIVED!*\n"+
			"━━━━━━━━━━━━━━━━━━━━\n"+
			"🔖 *Order No:* `%s`\n"+
			"🏢 *Branch:* %s\n"+
			"👤 *Customer:* %s (%s)\n"+
			"💰 *Total Amount:* **$%.2f**\n"+
			"💳 *Payment:* %s\n"+
			"📌 *Status:* %s\n"+
			"⏰ *Time:* %s\n"+
			"━━━━━━━━━━━━━━━━━━━━",
		order.OrderNo,
		branchName,
		order.CustomerName,
		order.CustomerPhone,
		order.TotalAmount,
		order.PaymentMethod,
		order.Status,
		time.Now().Format("02-Jan-2006 15:04"),
	)
	return b.SendMessage(b.alertChatID, msg)
}

func (b *BotService) NotifyTradeInSubmission(req *domain.TradeInRequest) error {
	msg := fmt.Sprintf(
		"🔄 *VEHICLE TRADE-IN / BUY-RESELL REQUEST*\n"+
			"━━━━━━━━━━━━━━━━━━━━\n"+
			"👤 *Customer:* %s (%s)\n"+
			"🚘 *Vehicle:* %s %s (%d)\n"+
			"🛣 *Mileage:* %d km\n"+
			"💵 *Expected Price:* $%.2f\n"+
			"🏢 *Target Branch:* %s\n"+
			"📝 *Notes:* %s\n"+
			"━━━━━━━━━━━━━━━━━━━━\n"+
			"👉 *Action Required:* Please review in Admin Panel for appraisal inspection.",
		req.CustomerName,
		req.CustomerPhone,
		req.CurrentBrand,
		req.CurrentModel,
		req.CurrentYear,
		req.CurrentMileage,
		req.CustomerExpectedPrice,
		req.TargetBranchName,
		req.ConditionDescription,
	)
	return b.SendMessage(b.alertChatID, msg)
}

func (b *BotService) NotifyLoanApplication(app *domain.InstallmentApplication) error {
	msg := fmt.Sprintf(
		"📋 *NEW INSTALLMENT LOAN APPLICATION*\n"+
			"━━━━━━━━━━━━━━━━━━━━\n"+
			"🔖 *Order Ref:* `%s`\n"+
			"👤 *Customer:* %s\n"+
			"🚘 *Vehicle Price:* $%.2f\n"+
			"💵 *Down Payment:* $%.2f (%.1f%%)\n"+
			"🏦 *Loan Amount:* $%.2f\n"+
			"📅 *Term:* %d Months @ %.2f%%\n"+
			"💳 *Monthly Due:* **$%.2f / month**\n"+
			"━━━━━━━━━━━━━━━━━━━━\n"+
			"Status: *UNDER REVIEW*",
		app.OrderNo,
		app.CustomerName,
		app.VehiclePrice,
		app.DownPayment,
		app.DownPaymentPercentage,
		app.LoanAmount,
		app.TermMonths,
		app.InterestRateAnnual,
		app.MonthlyInstallment,
	)
	return b.SendMessage(b.alertChatID, msg)
}

func (b *BotService) NotifyLowStock(branchName, productName string, currentQty, threshold int) error {
	msg := fmt.Sprintf(
		"⚠️ *LOW STOCK WARNING!*\n"+
			"━━━━━━━━━━━━━━━━━━━━\n"+
			"🏢 *Branch:* %s\n"+
			"📦 *Product:* %s\n"+
			"📉 *Current Quantity:* %d units (Threshold: %d)\n"+
			"━━━━━━━━━━━━━━━━━━━━\n"+
			"👉 Please create an Inter-Branch Transfer or Restock Order.",
		branchName,
		productName,
		currentQty,
		threshold,
	)
	return b.SendMessage(b.alertChatID, msg)
}
