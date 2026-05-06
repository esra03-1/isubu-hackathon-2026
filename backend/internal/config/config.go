package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port       string
	GroqModel  string
	DemoMode   bool
	GroqAPIKey string
}

func Load() Config {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Printf("Error loading .env file: %v", err)
	}

	return Config{
		Port:       getEnv("PORT", "8080"),
		GroqModel:  getEnv("GROQ_MODEL", "llama-3.1-8b-instant"),
		DemoMode:   parseBool(getEnv("DEMO_MODE", "true")),
		GroqAPIKey: getEnv("GROQ_API_KEY", ""),
	}
}

func getEnv(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	return value
}

func parseBool(value string) bool {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}
