package api_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"onenext/backend/internal/api"
	"onenext/backend/internal/config"
	"onenext/backend/internal/models"
	"onenext/backend/internal/storage"
)

func setupTestRouter(t *testing.T) http.Handler {
	t.Helper()

	cfg := config.Config{
		GroqModel:    "test-model",
		DemoMode:     true,
		DatabasePath: ":memory:",
		Timezone:     "UTC",
	}
	store, err := storage.Open(cfg.DatabasePath)
	if err != nil {
		t.Fatalf("Failed to open test store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("Failed to close test store: %v", err)
		}
	})
	return api.NewRouter(cfg, store)
}

func TestCompileEndpoint_ValidInput(t *testing.T) {
	router := setupTestRouter(t)

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
	if len(plan.Timeline) == 0 || plan.Timeline[0].Duration == "" {
		t.Errorf("Expected timeline duration in compiled plan")
	}
}

func TestCompileEndpoint_EmptyInput(t *testing.T) {
	router := setupTestRouter(t)

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
	router := setupTestRouter(t)

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
	router := setupTestRouter(t)

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

func TestPlansEndpoint_SaveListGetAndCalendar(t *testing.T) {
	router := setupTestRouter(t)
	clientID := "test-client-1"
	today := time.Now().UTC().Format("2006-01-02")

	saveReq := httptest.NewRequest(http.MethodPost, "/api/v1/plans", strings.NewReader(`{"raw_input":"quiz tomorrow and reply to Ali"}`))
	saveReq.Header.Set("Content-Type", "application/json")
	saveReq.Header.Set("X-OneNext-Client-ID", clientID)

	saveResp := httptest.NewRecorder()
	router.ServeHTTP(saveResp, saveReq)

	if saveResp.Code != http.StatusCreated {
		t.Fatalf("Expected status %d, got %d: %s", http.StatusCreated, saveResp.Code, saveResp.Body.String())
	}

	var savedPlan models.SavedPlan
	if err := json.Unmarshal(saveResp.Body.Bytes(), &savedPlan); err != nil {
		t.Fatalf("Failed to parse saved plan: %v", err)
	}
	if savedPlan.ID == "" {
		t.Fatalf("Expected saved plan id")
	}
	if savedPlan.CompiledPlan.Focus.Title == "" {
		t.Fatalf("Expected saved compiled plan")
	}
	if len(savedPlan.CompiledPlan.Timeline) == 0 || savedPlan.CompiledPlan.Timeline[0].Duration == "" {
		t.Fatalf("Expected saved timeline items to include duration")
	}
	if len(savedPlan.CompiledPlan.CalendarEvents) == 0 {
		t.Fatalf("Expected demo plan to include dated calendar events")
	}
	if savedPlan.CompiledPlan.CalendarEvents[0].Date == "" {
		t.Fatalf("Expected compiled calendar events to include dates")
	}
	if savedPlan.PlanningDate != today {
		t.Fatalf("Expected planning date %s, got %s", today, savedPlan.PlanningDate)
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/plans", nil)
	listReq.Header.Set("X-OneNext-Client-ID", clientID)

	listResp := httptest.NewRecorder()
	router.ServeHTTP(listResp, listReq)

	if listResp.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d: %s", http.StatusOK, listResp.Code, listResp.Body.String())
	}

	var listBody struct {
		Plans []models.PlanSummary `json:"plans"`
	}
	if err := json.Unmarshal(listResp.Body.Bytes(), &listBody); err != nil {
		t.Fatalf("Failed to parse plan list: %v", err)
	}
	if len(listBody.Plans) != 1 || listBody.Plans[0].ID != savedPlan.ID {
		t.Fatalf("Expected saved plan in list, got %+v", listBody.Plans)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/plans/"+savedPlan.ID, nil)
	getReq.Header.Set("X-OneNext-Client-ID", clientID)

	getResp := httptest.NewRecorder()
	router.ServeHTTP(getResp, getReq)

	if getResp.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d: %s", http.StatusOK, getResp.Code, getResp.Body.String())
	}

	var fetchedPlan models.SavedPlan
	if err := json.Unmarshal(getResp.Body.Bytes(), &fetchedPlan); err != nil {
		t.Fatalf("Failed to parse fetched plan: %v", err)
	}
	if fetchedPlan.ID != savedPlan.ID || fetchedPlan.RawInput != savedPlan.RawInput {
		t.Fatalf("Expected fetched plan to match saved plan")
	}

	calendarReq := httptest.NewRequest(http.MethodGet, "/api/v1/calendar?start="+today+"&end="+today, nil)
	calendarReq.Header.Set("X-OneNext-Client-ID", clientID)

	calendarResp := httptest.NewRecorder()
	router.ServeHTTP(calendarResp, calendarReq)

	if calendarResp.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d: %s", http.StatusOK, calendarResp.Code, calendarResp.Body.String())
	}

	var calendarBody struct {
		Events []models.CalendarEvent `json:"events"`
	}
	if err := json.Unmarshal(calendarResp.Body.Bytes(), &calendarBody); err != nil {
		t.Fatalf("Failed to parse calendar events: %v", err)
	}
	if len(calendarBody.Events) == 0 {
		t.Fatalf("Expected calendar events derived from saved timeline")
	}
	if calendarBody.Events[0].PlanID != savedPlan.ID {
		t.Fatalf("Expected event to reference saved plan")
	}

	futureDate := savedPlan.CompiledPlan.CalendarEvents[0].Date
	futureCalendarReq := httptest.NewRequest(http.MethodGet, "/api/v1/calendar?start="+futureDate+"&end="+futureDate, nil)
	futureCalendarReq.Header.Set("X-OneNext-Client-ID", clientID)

	futureCalendarResp := httptest.NewRecorder()
	router.ServeHTTP(futureCalendarResp, futureCalendarReq)

	if futureCalendarResp.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d: %s", http.StatusOK, futureCalendarResp.Code, futureCalendarResp.Body.String())
	}

	var futureCalendarBody struct {
		Events []models.CalendarEvent `json:"events"`
	}
	if err := json.Unmarshal(futureCalendarResp.Body.Bytes(), &futureCalendarBody); err != nil {
		t.Fatalf("Failed to parse future calendar events: %v", err)
	}
	if len(futureCalendarBody.Events) == 0 {
		t.Fatalf("Expected persisted AI calendar events")
	}
	if futureCalendarBody.Events[0].ID == "" {
		t.Fatalf("Expected backend-generated calendar event id")
	}
	if futureCalendarBody.Events[0].Source != "ai_calendar_event" {
		t.Fatalf("Expected ai_calendar_event source, got %s", futureCalendarBody.Events[0].Source)
	}
}

func TestPlansEndpoint_PlanningDateSavesTimelineEventsToSelectedDate(t *testing.T) {
	router := setupTestRouter(t)
	clientID := "test-client-selected-date"
	planningDate := "2026-05-12"

	saveReq := httptest.NewRequest(http.MethodPost, "/api/v1/plans", strings.NewReader(`{"raw_input":"quiz tomorrow and reply to Ali","planning_date":"`+planningDate+`"}`))
	saveReq.Header.Set("Content-Type", "application/json")
	saveReq.Header.Set("X-OneNext-Client-ID", clientID)

	saveResp := httptest.NewRecorder()
	router.ServeHTTP(saveResp, saveReq)

	if saveResp.Code != http.StatusCreated {
		t.Fatalf("Expected status %d, got %d: %s", http.StatusCreated, saveResp.Code, saveResp.Body.String())
	}

	var savedPlan models.SavedPlan
	if err := json.Unmarshal(saveResp.Body.Bytes(), &savedPlan); err != nil {
		t.Fatalf("Failed to parse saved plan: %v", err)
	}
	if savedPlan.PlanningDate != planningDate {
		t.Fatalf("Expected planning date %s, got %s", planningDate, savedPlan.PlanningDate)
	}

	calendarReq := httptest.NewRequest(http.MethodGet, "/api/v1/calendar?start="+planningDate+"&end="+planningDate, nil)
	calendarReq.Header.Set("X-OneNext-Client-ID", clientID)

	calendarResp := httptest.NewRecorder()
	router.ServeHTTP(calendarResp, calendarReq)

	if calendarResp.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d: %s", http.StatusOK, calendarResp.Code, calendarResp.Body.String())
	}

	var calendarBody struct {
		Events []models.CalendarEvent `json:"events"`
	}
	if err := json.Unmarshal(calendarResp.Body.Bytes(), &calendarBody); err != nil {
		t.Fatalf("Failed to parse calendar events: %v", err)
	}
	if len(calendarBody.Events) == 0 {
		t.Fatalf("Expected calendar events on selected planning date")
	}
	if calendarBody.Events[0].Date != planningDate {
		t.Fatalf("Expected selected planning date %s, got %s", planningDate, calendarBody.Events[0].Date)
	}
	if calendarBody.Events[0].Source != "compiled_plan" {
		t.Fatalf("Expected compiled_plan source, got %s", calendarBody.Events[0].Source)
	}
}

func TestPlansEndpoint_InvalidPlanningDateReturnsBadRequest(t *testing.T) {
	router := setupTestRouter(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/plans", strings.NewReader(`{"raw_input":"buy milk","planning_date":"2026-13-99"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-OneNext-Client-ID", "test-client-invalid-date")

	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	if resp.Code != http.StatusBadRequest {
		t.Fatalf("Expected status %d, got %d", http.StatusBadRequest, resp.Code)
	}

	var errResp models.ErrorResponse
	if err := json.Unmarshal(resp.Body.Bytes(), &errResp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}
	if errResp.Error.Code != "invalid_planning_date" {
		t.Fatalf("Expected invalid_planning_date, got %s", errResp.Error.Code)
	}
}

func TestPlansEndpoint_MissingClientID(t *testing.T) {
	router := setupTestRouter(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/plans", nil)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	if resp.Code != http.StatusBadRequest {
		t.Fatalf("Expected status %d, got %d", http.StatusBadRequest, resp.Code)
	}

	var errResp models.ErrorResponse
	if err := json.Unmarshal(resp.Body.Bytes(), &errResp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}
	if errResp.Error.Code != "missing_client_id" {
		t.Fatalf("Expected missing_client_id, got %s", errResp.Error.Code)
	}
}
