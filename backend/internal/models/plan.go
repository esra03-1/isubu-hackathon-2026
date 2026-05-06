package models

type CompileRequest struct {
	RawInput string `json:"raw_input"`
}

type CompiledPlan struct {
	Summary  Summary        `json:"summary"`
	Focus    FocusAction    `json:"focus"`
	Timeline []TimelineItem `json:"timeline"`
	Replies  []ReplyDraft   `json:"replies"`
	Insights []Insight      `json:"insights"`
	Debug    DebugInfo      `json:"debug"`
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
	ID    string `json:"id"`
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
