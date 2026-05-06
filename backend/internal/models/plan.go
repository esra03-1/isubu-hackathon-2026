package models

type CompileRequest struct {
	RawInput string `json:"raw_input"`
}

type SavePlanRequest struct {
	RawInput     string `json:"raw_input"`
	PlanningDate string `json:"planning_date"`
}

type SavedPlan struct {
	ID           string       `json:"id"`
	ClientID     string       `json:"client_id"`
	RawInput     string       `json:"raw_input"`
	PlanningDate string       `json:"planning_date"`
	CompiledPlan CompiledPlan `json:"compiled_plan"`
	CreatedAt    string       `json:"created_at"`
}

type PlanSummary struct {
	ID        string `json:"id"`
	Headline  string `json:"headline"`
	Focus     string `json:"focus"`
	CreatedAt string `json:"created_at"`
}

type CalendarEvent struct {
	ID        string `json:"id"`
	ClientID  string `json:"client_id"`
	PlanID    string `json:"plan_id"`
	Date      string `json:"date"`
	Time      string `json:"time"`
	Title     string `json:"title"`
	Type      string `json:"type"`
	Source    string `json:"source"`
	CreatedAt string `json:"created_at"`
}

type CompiledPlan struct {
	Summary        Summary                 `json:"summary"`
	Focus          FocusAction             `json:"focus"`
	Timeline       []TimelineItem          `json:"timeline"`
	CalendarEvents []CompiledCalendarEvent `json:"calendar_events"`
	Replies        []ReplyDraft            `json:"replies"`
	Insights       []Insight               `json:"insights"`
	Debug          DebugInfo               `json:"debug"`
}

type Summary struct {
	Headline              string `json:"headline"`
	EstimatedSavedMinutes int    `json:"estimated_saved_minutes"`
	DominantPressure      string `json:"dominant_pressure"`
}

type FocusAction struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Reason   string `json:"reason"`
	Duration string `json:"duration"`
	Urgency  string `json:"urgency"`
}

type TimelineItem struct {
	ID       string `json:"id"`
	Time     string `json:"time"`
	Title    string `json:"title"`
	Type     string `json:"type"`
	Duration string `json:"duration"`
}

type CompiledCalendarEvent struct {
	Date  string `json:"date"`
	Time  string `json:"time"`
	Title string `json:"title"`
	Type  string `json:"type"`
}

type ReplyDraft struct {
	ID        string `json:"id"`
	Recipient string `json:"recipient"`
	Context   string `json:"context"`
	Draft     string `json:"draft"`
}

type Insight struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

type DebugInfo struct {
	Model          string   `json:"model"`
	RawModelOutput string   `json:"raw_model_output"`
	FallbackUsed   bool     `json:"fallback_used"`
	Warnings       []string `json:"warnings"`
}

type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
