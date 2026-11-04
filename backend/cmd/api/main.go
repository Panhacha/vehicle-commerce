package main

import (
	"log"
	"path/filepath"

	"vehicle-commerce/backend/internal/config"
	"vehicle-commerce/backend/internal/delivery/http"
	"vehicle-commerce/backend/internal/repository"
	"vehicle-commerce/backend/internal/telegram"
	"vehicle-commerce/backend/internal/usecase"
)

func main() {
	log.Println("=========================================================")
	log.Println("🚀 Starting Vehicle E-commerce & Multi-Branch Backend API")
	log.Println("=========================================================")

	cfg := config.LoadConfig()
	if len(cfg.JWTSecret) < 32 {
		log.Fatal("JWT_SECRET must be configured with at least 32 characters")
	}

	// 1. Initialize Database
	db, err := repository.NewDB(cfg)
	if err != nil {
		log.Printf("[Warning] Database connection failed: %v", err)
	} else {
		// Run migrations
		migPath, _ := filepath.Abs("migrations")
		if err := db.RunMigrations(migPath); err != nil {
			log.Fatalf("Failed to apply database migrations: %v", err)
		}
	}

	// 2. Initialize Telegram Bot Service
	bot := telegram.NewBotService(cfg.TelegramToken, cfg.TelegramChatID)
	if cfg.TelegramToken != "" {
		log.Println("[Telegram Bot] Bot integration active.")
	} else {
		log.Println("[Telegram Bot] Running in Mock/Log mode (Set TELEGRAM_BOT_TOKEN to activate real alerts).")
	}

	// 3. Initialize Services & Delivery
	svc := usecase.NewService(db, bot, cfg)
	handler := http.NewHandler(svc, cfg)
	router := handler.InitRouter()

	log.Printf("Server listening on port :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to run HTTP server: %v", err)
	}
}
