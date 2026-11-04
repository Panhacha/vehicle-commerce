package config

import (
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	JWTSecret      string
	TelegramToken  string
	TelegramChatID string
	FrontendURL    string
}

func LoadConfig() *Config {
	// Try loading .env from current directory, relative paths, or exe path
	_ = godotenv.Load(".env")
	_ = godotenv.Load("backend/.env")
	if exe, err := os.Executable(); err == nil {
		_ = godotenv.Load(filepath.Join(filepath.Dir(exe), ".env"))
	}
	_ = godotenv.Load("D:/Project/vehicle-commerce/backend/.env")

	getEnv := func(key, fallback string) string {
		if val := os.Getenv(key); val != "" {
			return val
		}
		return fallback
	}

	return &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "postgres"),
		DBSSLMode:      getEnv("DB_SSLMODE", "require"),
		JWTSecret:      getEnv("JWT_SECRET", ""),
		TelegramToken:  getEnv("TELEGRAM_BOT_TOKEN", ""),
		TelegramChatID: getEnv("TELEGRAM_ALERT_CHAT_ID", ""),
		FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:3000"),
	}
}
