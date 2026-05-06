package config

import (
	"os"
	"strings"
)

type Config struct {
	Port      string
	GroqModel string
	DemoMode  bool
}

func Load() Config {
	return Config{
		Port:      getEnv("PORT", "8080"),
		GroqModel: getEnv("GROQ_MODEL", "demo"),
		DemoMode:  parseBool(getEnv("DEMO_MODE", "true")),
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
