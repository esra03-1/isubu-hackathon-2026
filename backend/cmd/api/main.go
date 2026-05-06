package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"onenext/backend/internal/config"
	"onenext/backend/internal/handlers"
)

func main() {
	cfg := config.Load()

	router := gin.Default()
	api := router.Group("/api/v1")
	{
		compileHandler := handlers.NewCompileHandler(cfg.GroqModel)
		api.GET("/health", handlers.Health)
		api.POST("/compile", compileHandler.Compile)
	}

	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
