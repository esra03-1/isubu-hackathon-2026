package main

import (
	"log"

	"onenext/backend/internal/api"
	"onenext/backend/internal/config"
	"onenext/backend/internal/storage"
)

func main() {
	cfg := config.Load()

	store, err := storage.Open(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("database failed: %v", err)
	}
	defer store.Close()

	router := api.NewRouter(cfg, store)

	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
