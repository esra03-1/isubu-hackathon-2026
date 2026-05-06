package api

import (
	"github.com/gin-gonic/gin"
	"onenext/backend/internal/config"
	"onenext/backend/internal/handlers"
)

// NewRouter sets up the Gin engine and wires all API routes.
func NewRouter(cfg config.Config) *gin.Engine {
	// Set gin mode to release or test based on environment if needed,
	// but default is fine for MVP.
	router := gin.Default()

	api := router.Group("/api/v1")
	{
		compileHandler := handlers.NewCompileHandler(cfg)
		api.GET("/health", handlers.Health)
		api.POST("/compile", compileHandler.Compile)
	}

	return router
}
