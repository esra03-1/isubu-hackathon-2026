package handlers

import (
	"net/http"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"onenext/backend/internal/models"
	"onenext/backend/internal/services"
)

const MaxRawInputLength = 12000

type CompileHandler struct {
	Model string
}

func NewCompileHandler(model string) CompileHandler {
	return CompileHandler{Model: model}
}

func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h CompileHandler) Compile(c *gin.Context) {
	var request models.CompileRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		writeError(c, http.StatusBadRequest, "invalid_request", "Request body must be valid JSON with raw_input.")
		return
	}

	rawInput := strings.TrimSpace(request.RawInput)
	if rawInput == "" {
		writeError(c, http.StatusBadRequest, "empty_raw_input", "raw_input is required.")
		return
	}

	if utf8.RuneCountInString(rawInput) > MaxRawInputLength {
		writeError(c, http.StatusRequestEntityTooLarge, "raw_input_too_long", "raw_input is too long.")
		return
	}

	c.JSON(http.StatusOK, services.DemoPlan(h.Model))
}

func writeError(c *gin.Context, status int, code string, message string) {
	c.JSON(status, models.ErrorResponse{
		Error: models.ErrorBody{
			Code:    code,
			Message: message,
		},
	})
}
