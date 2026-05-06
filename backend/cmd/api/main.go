package main

import (
	"log"

	"onenext/backend/internal/api"
	"onenext/backend/internal/config"
)

func main() {
	cfg := config.Load()

	router := api.NewRouter(cfg)

	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
