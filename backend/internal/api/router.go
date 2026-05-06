package api

import (
	"github.com/gin-gonic/gin"
	"onenext/backend/internal/config"
	"onenext/backend/internal/handlers"
	"onenext/backend/internal/storage"
)

// NewRouter sets up the Gin engine and wires all API routes.
func NewRouter(cfg config.Config, store *storage.Store) *gin.Engine {
	// Set gin mode to release or test based on environment if needed,
	// but default is fine for MVP.
	router := gin.Default()

	api := router.Group("/api/v1")
	{
		compileHandler := handlers.NewCompileHandler(cfg)
		api.GET("/health", handlers.Health)
		api.POST("/compile", compileHandler.Compile)

		if store != nil {
			planHandler := handlers.NewPlanHandler(cfg, store)
			calendarHandler := handlers.NewCalendarHandler(store)
			api.POST("/plans", planHandler.Save)
			api.GET("/plans", planHandler.List)
			api.GET("/plans/:id", planHandler.Get)
			api.GET("/calendar", calendarHandler.List)
		}
	}

	return router
}
