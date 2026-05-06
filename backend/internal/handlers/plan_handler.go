package handlers

import (
	"errors"
	"log"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"onenext/backend/internal/config"
	"onenext/backend/internal/models"
	"onenext/backend/internal/services"
	"onenext/backend/internal/storage"
)

const clientIDHeader = "X-OneNext-Client-ID"

type PlanHandler struct {
	Cfg   config.Config
	Store *storage.Store
}

func NewPlanHandler(cfg config.Config, store *storage.Store) PlanHandler {
	return PlanHandler{Cfg: cfg, Store: store}
}

func (h PlanHandler) Save(c *gin.Context) {
	clientID, ok := readClientID(c)
	if !ok {
		return
	}

	var request models.SavePlanRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		writeError(c, http.StatusBadRequest, "invalid_request", "Request body must be valid JSON with raw_input.")
		return
	}

	rawInput := strings.TrimSpace(request.RawInput)
	if rawInput == "" {
		writeError(c, http.StatusBadRequest, "empty_raw_input", "raw_input is required.")
		return
	}
	customization := trimCustomization(request.Customization)

	if utf8.RuneCountInString(rawInput) > MaxRawInputLength {
		writeError(c, http.StatusRequestEntityTooLarge, "raw_input_too_long", "raw_input is too long.")
		return
	}

	now, err := nowInLocation(h.Cfg.Timezone)
	if err != nil {
		writeError(c, http.StatusInternalServerError, "invalid_timezone", "Server timezone is invalid.")
		return
	}
	planningDate := now.Format("2006-01-02")
	if request.PlanningDate != "" {
		planningDate = strings.TrimSpace(request.PlanningDate)
		if !validDate(planningDate) {
			writeError(c, http.StatusBadRequest, "invalid_planning_date", "planning_date must use YYYY-MM-DD.")
			return
		}
	}

	plan := services.DemoPlan(h.Cfg.GroqModel)
	if !h.Cfg.DemoMode {
		planningDay, err := time.ParseInLocation("2006-01-02", planningDate, now.Location())
		if err != nil {
			writeError(c, http.StatusInternalServerError, "invalid_planning_date", "planning_date could not be resolved.")
			return
		}

		contextEndDate := planningDay.AddDate(0, 0, 30).Format("2006-01-02")
		events, err := h.Store.ListCalendarEvents(c.Request.Context(), clientID, planningDate, contextEndDate)
		if err != nil {
			writeError(c, http.StatusInternalServerError, "calendar_context_failed", "Could not prepare calendar context.")
			return
		}

		promptContext := services.BuildPromptContext(now, planningDate, h.Cfg.Timezone, events, customization)
		compiledPlan, err := services.CompileInputWithPromptContext(c.Request.Context(), h.Cfg, rawInput, promptContext)
		if err != nil {
			log.Printf("Compilation failed during save: %v", err)
		} else {
			plan = *compiledPlan
		}
	}

	savedPlan, err := h.Store.SavePlan(c.Request.Context(), clientID, rawInput, plan, planningDate, customization)
	if err != nil {
		writeError(c, http.StatusInternalServerError, "save_plan_failed", "Could not save compiled plan.")
		return
	}

	c.JSON(http.StatusCreated, savedPlan)
}

func trimCustomization(customization models.PlanCustomization) models.PlanCustomization {
	return models.PlanCustomization{
		Name:            strings.TrimSpace(customization.Name),
		Age:             strings.TrimSpace(customization.Age),
		RoleOrSchool:    strings.TrimSpace(customization.RoleOrSchool),
		SleepWindow:     strings.TrimSpace(customization.SleepWindow),
		SchoolHours:     strings.TrimSpace(customization.SchoolHours),
		WorkHours:       strings.TrimSpace(customization.WorkHours),
		ProductiveHours: strings.TrimSpace(customization.ProductiveHours),
		FocusDuration:   strings.TrimSpace(customization.FocusDuration),
		DailyWorkGoal:   strings.TrimSpace(customization.DailyWorkGoal),
		Priorities:      strings.TrimSpace(customization.Priorities),
		FocusHelpers:    strings.TrimSpace(customization.FocusHelpers),
		Challenges:      strings.TrimSpace(customization.Challenges),
		AdditionalNotes: strings.TrimSpace(customization.AdditionalNotes),
	}
}

func (h PlanHandler) List(c *gin.Context) {
	clientID, ok := readClientID(c)
	if !ok {
		return
	}

	plans, err := h.Store.ListPlans(c.Request.Context(), clientID)
	if err != nil {
		writeError(c, http.StatusInternalServerError, "list_plans_failed", "Could not list saved plans.")
		return
	}

	c.JSON(http.StatusOK, gin.H{"plans": plans})
}

func (h PlanHandler) Get(c *gin.Context) {
	clientID, ok := readClientID(c)
	if !ok {
		return
	}

	planID := strings.TrimSpace(c.Param("id"))
	if planID == "" {
		writeError(c, http.StatusBadRequest, "missing_plan_id", "Plan id is required.")
		return
	}

	plan, err := h.Store.GetPlan(c.Request.Context(), clientID, planID)
	if errors.Is(err, storage.ErrNotFound) {
		writeError(c, http.StatusNotFound, "plan_not_found", "Plan was not found.")
		return
	}
	if err != nil {
		writeError(c, http.StatusInternalServerError, "get_plan_failed", "Could not fetch saved plan.")
		return
	}

	c.JSON(http.StatusOK, plan)
}

type CalendarHandler struct {
	Store *storage.Store
}

func NewCalendarHandler(store *storage.Store) CalendarHandler {
	return CalendarHandler{Store: store}
}

func (h CalendarHandler) List(c *gin.Context) {
	clientID, ok := readClientID(c)
	if !ok {
		return
	}

	startDate := strings.TrimSpace(c.Query("start"))
	endDate := strings.TrimSpace(c.Query("end"))
	if !validDate(startDate) || !validDate(endDate) {
		writeError(c, http.StatusBadRequest, "invalid_date_range", "start and end must use YYYY-MM-DD.")
		return
	}
	if startDate > endDate {
		writeError(c, http.StatusBadRequest, "invalid_date_range", "start must be before or equal to end.")
		return
	}

	events, err := h.Store.ListCalendarEvents(c.Request.Context(), clientID, startDate, endDate)
	if err != nil {
		writeError(c, http.StatusInternalServerError, "list_calendar_failed", "Could not list calendar events.")
		return
	}

	c.JSON(http.StatusOK, gin.H{"events": events})
}

func readClientID(c *gin.Context) (string, bool) {
	clientID := strings.TrimSpace(c.GetHeader(clientIDHeader))
	if clientID == "" {
		writeError(c, http.StatusBadRequest, "missing_client_id", clientIDHeader+" header is required.")
		return "", false
	}

	for _, r := range clientID {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			continue
		}
		writeError(c, http.StatusBadRequest, "invalid_client_id", clientIDHeader+" may only contain letters, numbers, dash, and underscore.")
		return "", false
	}

	return clientID, true
}

func nowInLocation(timezone string) (time.Time, error) {
	location, err := time.LoadLocation(timezone)
	if err != nil {
		return time.Time{}, err
	}
	return time.Now().In(location), nil
}

func validDate(value string) bool {
	if value == "" {
		return false
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return false
	}
	return parsed.Format("2006-01-02") == value
}
