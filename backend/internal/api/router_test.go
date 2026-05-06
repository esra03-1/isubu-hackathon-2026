package api_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"onenext/backend/internal/api"
	"onenext/backend/internal/config"
	"onenext/backend/internal/models"
)

func setupTestRouter() http.Handler {
	cfg := config.Config{
		GroqModel: "test-model",
		DemoMode:  true,
	}
	return api.NewRouter(cfg)
}

func TestCompileEndpoint_ValidInput(t *testing.T) {
	router := setupTestRouter()

	reqBody := `{"raw_input": "buy milk"}`
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/compile", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var plan models.CompiledPlan
	if err := json.Unmarshal(w.Body.Bytes(), &plan); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if plan.Summary.Headline == "" {
		t.Errorf("Expected valid demo plan, got empty summary headline")
	}
}

func TestCompileEndpoint_EmptyInput(t *testing.T) {
	router := setupTestRouter()

	reqBody := `{"raw_input": "   "}`
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/compile", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}

	var errResp models.ErrorResponse
	if err := json.Unmarshal(w.Body.Bytes(), &errResp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if errResp.Error.Code != "empty_raw_input" {
		t.Errorf("Expected code 'empty_raw_input', got '%s'", errResp.Error.Code)
	}
}

func TestCompileEndpoint_OversizedInput(t *testing.T) {
	router := setupTestRouter()

	reqBodyBytes, _ := json.Marshal(map[string]string{
		"raw_input": strings.Repeat("a", 12001),
	})

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/compile", bytes.NewReader(reqBodyBytes))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("Expected status %d, got %d", http.StatusRequestEntityTooLarge, w.Code)
	}

	var errResp models.ErrorResponse
	if err := json.Unmarshal(w.Body.Bytes(), &errResp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if errResp.Error.Code != "raw_input_too_long" {
		t.Errorf("Expected code 'raw_input_too_long', got '%s'", errResp.Error.Code)
	}
}

func TestCompileEndpoint_InvalidJSON(t *testing.T) {
	router := setupTestRouter()

	reqBody := `{"raw_input": "missing quotes}` // invalid json
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/compile", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}

	var errResp models.ErrorResponse
	if err := json.Unmarshal(w.Body.Bytes(), &errResp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if errResp.Error.Code != "invalid_request" {
		t.Errorf("Expected code 'invalid_request', got '%s'", errResp.Error.Code)
	}
}
