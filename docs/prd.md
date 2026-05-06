# OneNext MVP Product Requirements Document

## 1. Product Summary

**Product Name:** OneNext

**Slogan:** Messy day in. One next move out.

**Turkish Slogan:** Dağınık gününü sıradaki adıma dönüştür.

**Product Description:**  
OneNext is an AI-assisted daily planning web application that reduces decision fatigue by turning messy daily input into an executable day plan. The user pastes scattered notes, messages, reminders, deadlines, and errands. OneNext compiles them into a focused next action, a chronological day flow, risk/preparation insights, and reply drafts.

**MVP Goal:**  
The MVP must accept one unstructured text block, send it to the Go backend, compile it using an LLM through Groq, validate the structured response, and display the result in a polished React web interface.

The core demo should prove this transformation:

> Chaotic daily input → one next action + timeline + warnings + reply drafts.

## 2. Target Users

Primary users:

- Overwhelmed students
- People experiencing decision fatigue
- People with ADHD-like task paralysis
- Busy professionals managing scattered daily obligations

The product should be understandable to anyone who has too many small obligations and does not know what to do first.

## 3. Core Problem

People repeatedly waste time converting scattered daily inputs into action.

Examples:

- WhatsApp-style messages
- Class deadlines
- Personal errands
- Work reminders
- “I should not forget this” notes
- Replies they need to send
- Ambiguous obligations with missing information

This planning and prioritization process is repeated every day and creates decision fatigue.

## 4. Core Promise

OneNext reduces decision fatigue by telling the user what to do next, while also turning the rest of the day into a clear executable plan.

## 5. MVP Scope

### Must Have

- React web frontend
- Go backend
- `POST /api/v1/compile` endpoint
- Groq LLM integration
- Strict JSON response contract
- Demo fallback response if LLM fails or demo mode is enabled
- Input screen with large text area
- Result screen with:
  - Focus card
  - Animated/staged timeline reveal
  - Collapsible insights
  - Collapsible reply drafts
  - Hidden debug panel
- Local save of the last successful compiled plan using `localStorage`
- Documentation:
  - `PRD.md`
  - `ARCHITECTURE.md`
  - `ROADMAP.md`
  - `AI_USAGE_LOG.md`

### Should Have

- Copy button for reply drafts
- Copy full plan button
- Estimated saved time
- Turkish UI labels
- Mixed Turkish/English input support
- Anonymous device-based persistence for saved plans
- Internal OneNext calendar events derived from saved timelines

### Nice to Have / Stretch

- Share card image export
- Light/dark mode
- Weekly/monthly calendar views
- AI prompt context from internal calendar history
- More advanced animations

### Explicitly Out of Scope

- User authentication
- External calendar integration
- Gmail integration
- WhatsApp integration
- Push notifications
- Native mobile app
- OCR
- Voice input
- Browser extension
- Recurring tasks
- Multi-user collaboration
- Payment system
- Complex database-backed history

## 6. Tech Stack

### Repository Type

Monorepo.

```text
/onenext
├── /backend
├── /web
├── PRD.md
├── ARCHITECTURE.md
├── ROADMAP.md
└── AI_USAGE_LOG.md
Backend
Go 1.25+
Gin or Fiber
Groq API integration
Environment-based configuration
Strict struct-based JSON parsing
Clear error handling
Frontend
React
TypeScript
Vite or Next.js
Tailwind CSS
Optional: Framer Motion for staged reveal animation
LocalStorage for saving last compiled result
LLM Provider
Primary provider: Groq
Model configured by environment variable
No model name hardcoded into business logic

Example:

GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
PORT=8080
DEMO_MODE=false
DATABASE_PATH=data/onenext.db
APP_TIMEZONE=Europe/Istanbul
7. Architecture Overview

The frontend never talks directly to Groq.

The frontend sends raw input to the Go backend.

The backend:

Validates request body.
Sends prompt to Groq.
Receives model output.
Parses output into Go structs.
Validates required fields.
Normalizes invalid/missing values where possible.
Returns strict JSON to frontend.
Falls back to demo JSON if enabled or if LLM fails.
8. API Contract
Endpoint
POST /api/v1/compile
Request Body
{
  "raw_input": "string"
}
Success Response: 200 OK
{
  "summary": {
    "headline": "string",
    "estimated_saved_minutes": 45,
    "dominant_pressure": "deadline|social|errand|academic|work|mixed"
  },
  "focus": {
    "id": "string",
    "title": "string",
    "reason": "string",
    "duration": "string",
    "urgency": "high|medium|low"
  },
  "timeline": [
    {
      "id": "string",
      "time": "HH:MM",
      "title": "string",
      "type": "work|errand|meeting|academic|personal",
      "duration": "string"
    }
  ],
  "calendar_events": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "title": "string",
      "type": "work|errand|meeting|academic|personal"
    }
  ],
  "replies": [
    {
      "id": "string",
      "recipient": "string",
      "context": "string",
      "draft": "string"
    }
  ],
  "insights": [
    {
      "id": "string",
      "type": "prep|risk",
      "message": "string",
      "severity": "high|medium|low"
    }
  ],
  "debug": {
    "model": "string",
    "raw_model_output": "string",
    "fallback_used": false,
    "warnings": ["string"]
  }
}
Error Response
{
  "error": {
    "code": "string",
    "message": "string"
  }
}

Persistence Endpoints

Authenticated user accounts are out of scope. Persistence uses an anonymous device id sent by the frontend:

```text
X-OneNext-Client-ID: string
```

POST /api/v1/plans

Request body matches `POST /api/v1/compile`:

{
  "raw_input": "string",
  "planning_date": "YYYY-MM-DD optional",
  "customization": {
    "name": "string",
    "age": "string",
    "role_or_school": "string",
    "sleep_window": "string",
    "school_hours": "string",
    "work_hours": "string",
    "productive_hours": "string",
    "focus_duration": "string",
    "daily_work_goal": "string",
    "priorities": "string",
    "focus_helpers": "string",
    "challenges": "string",
    "additional_notes": "string"
  }
}

Success Response: 201 Created

{
  "id": "string",
  "client_id": "string",
  "raw_input": "string",
  "planning_date": "YYYY-MM-DD",
  "customization": { },
  "compiled_plan": { },
  "created_at": "string"
}

GET /api/v1/plans

Success Response: 200 OK

{
  "plans": [
    {
      "id": "string",
      "headline": "string",
      "focus": "string",
      "created_at": "string"
    }
  ]
}

GET /api/v1/plans/:id

Returns the saved plan shape from `POST /api/v1/plans`.

GET /api/v1/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD

Success Response: 200 OK

{
  "events": [
    {
      "id": "string",
      "client_id": "string",
      "plan_id": "string",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "title": "string",
      "type": "work|errand|meeting|academic|personal",
      "source": "compiled_plan|ai_calendar_event",
      "created_at": "string"
    }
  ]
}
9. Data Types
Backend Go Structs
type CompileRequest struct {
    RawInput string `json:"raw_input"`
}

type SavePlanRequest struct {
    RawInput      string            `json:"raw_input"`
    PlanningDate  string            `json:"planning_date"`
    Customization PlanCustomization `json:"customization"`
}

type PlanCustomization struct {
    Name            string `json:"name"`
    Age             string `json:"age"`
    RoleOrSchool    string `json:"role_or_school"`
    SleepWindow     string `json:"sleep_window"`
    SchoolHours     string `json:"school_hours"`
    WorkHours       string `json:"work_hours"`
    ProductiveHours string `json:"productive_hours"`
    FocusDuration   string `json:"focus_duration"`
    DailyWorkGoal   string `json:"daily_work_goal"`
    Priorities      string `json:"priorities"`
    FocusHelpers    string `json:"focus_helpers"`
    Challenges      string `json:"challenges"`
    AdditionalNotes string `json:"additional_notes"`
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
    Warnings        []string `json:"warnings"`
}
Frontend TypeScript Interfaces
export type Urgency = "high" | "medium" | "low";
export type TimelineType = "work" | "errand" | "meeting" | "academic" | "personal";
export type InsightType = "prep" | "risk";
export type DominantPressure = "deadline" | "social" | "errand" | "academic" | "work" | "mixed";

export interface CompileRequest {
  raw_input: string;
}

export interface PlanCustomization {
  name: string;
  age: string;
  role_or_school: string;
  sleep_window: string;
  school_hours: string;
  work_hours: string;
  productive_hours: string;
  focus_duration: string;
  daily_work_goal: string;
  priorities: string;
  focus_helpers: string;
  challenges: string;
  additional_notes: string;
}

export interface CompiledPlan {
  summary: Summary;
  focus: FocusAction;
  timeline: TimelineItem[];
  replies: ReplyDraft[];
  insights: Insight[];
  debug: DebugInfo;
}

export interface Summary {
  headline: string;
  estimated_saved_minutes: number;
  dominant_pressure: DominantPressure;
}

export interface FocusAction {
  id: string;
  title: string;
  reason: string;
  duration: string;
  urgency: Urgency;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  type: TimelineType;
  duration: string;
}

export interface ReplyDraft {
  id: string;
  recipient: string;
  context: string;
  draft: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  message: string;
  severity: Urgency;
}

export interface DebugInfo {
  model: string;
  raw_model_output: string;
  fallback_used: boolean;
  warnings: string[];
}
10. UI Requirements
Screen 1: Input Screen

Purpose: Let user paste daily chaos.

Components:

Product title: OneNext
Turkish subtitle: “Dağınık gününü sıradaki adıma dönüştür.”
Large multiline textarea
“Örnek Girdi Yükle” button
“Günü Derle” button
Loading state

Input placeholder:

Bugün yapmam gerekenleri, mesajları, hatırlatmaları veya aklındaki karışıklığı buraya yapıştır...

Example user input:

çarşamba hackathon fikrini netleştirmem lazım. melda hocaya cevap anahtarını güncellemem gerekiyor. eksik sayfaları taramam lazım. saat 16:00'da toplantı var. Ali'ye biraz gecikeceğimi yazmam lazım. marketten süt al. yarın quiz var ama daha bakmadım. context lingo işini de unutma.
Screen 2: Result Screen

Purpose: Show the compiled day.

Required sections:

Summary card
Focus card
Timeline
Collapsible insights
Collapsible reply drafts
Hidden debug panel
Staged Reveal Behavior

The result screen should feel like the day is being compiled.

Minimum animation requirement:

Summary card appears first.
Timeline items appear top-to-bottom with a small delay.
First/highest-priority item visually expands or is highlighted as the focus card.
Insights and replies remain collapsed by default.

This must stay simple. Do not build a complex animation engine.

11. Backend Requirements
Endpoint Behavior

POST /api/v1/compile must:

Reject empty raw_input.
Reject extremely long input.
Call Groq unless demo mode is enabled.
Request strict JSON from the model.
Parse the model response into Go structs.
Validate required fields.
Return CompiledPlan.
Return fallback demo data if:
DEMO_MODE=true
Groq request fails
Groq returns invalid JSON
rate limit occurs during demo
Backend Functions

Minimum expected functions:

func CompileHandler(c *gin.Context)
func CompileInput(ctx context.Context, rawInput string) (*CompiledPlan, error)
func BuildPrompt(rawInput string) string
func CallGroq(ctx context.Context, prompt string) (string, error)
func ParseCompiledPlan(raw string) (*CompiledPlan, error)
func ValidateCompiledPlan(plan *CompiledPlan) []string
func DemoCompiledPlan() *CompiledPlan

Function names may change, but responsibilities must remain.

12. LLM Prompt Requirements

The system prompt must instruct the model to:

Accept Turkish, English, or mixed input.
Return only valid JSON.
Avoid markdown.
Avoid commentary.
Infer realistic times only when needed.
Prefer the most concrete urgent action as focus.
Create a timeline from known times first, then inferred order.
Produce Turkish UI-facing text.
Draft short, natural Turkish replies.
Flag missing information or deadline risks.
Never invent important facts not present in input.
Use debug.warnings when assumptions are made.
13. Demo Mode

Demo mode is mandatory.

Demo mode must return a hardcoded fictional student/professional day.

Demo mode exists to protect the final presentation from:

Groq rate limits
Network failure
Invalid JSON
Slow model responses

Demo mode should be switchable through environment variable:

DEMO_MODE=true

The frontend may also include a visible “Demo Girdisi Yükle” button.

14. Local Save

The frontend should save the last successful compiled plan in localStorage.

Stored values:

Last raw input
Last compiled plan
Timestamp

No database is required for MVP.

If time remains, SQLite can be added as a stretch goal.

15. Acceptance Criteria

The MVP is accepted when:

User can paste messy daily input.
User can press “Günü Derle.”
Backend returns a valid compiled plan.
Frontend displays:
Summary
Focus card
Timeline
Insights
Replies
At least one reply can be copied.
Debug information can be viewed.
Demo mode works without calling Groq.
Last plan is saved locally.
App runs locally with one command per service.
App can be deployed through Docker.
Repository includes PRD.md, ARCHITECTURE.md, ROADMAP.md, and AI_USAGE_LOG.md.
16. Team Workflow

Team has 3 members.

Recommended split:

Lead / Backend Owner
Go backend
LLM integration
API contract
Merge control
Pull request review
Deployment coordination
Frontend Developer 1
React app skeleton
Input screen
API client
Result screen layout
Frontend Developer 2 / Polish & Documentation
Timeline components
Animation polish
Copy buttons
Debug panel
Documentation support
Demo script

All changes should happen through branches and pull requests.

Main branch should remain stable.

No backend API contract changes should be merged without frontend awareness.

17. Judging Alignment

This project should intentionally demonstrate:

AI-assisted development through documented prompts and code reviews
Professional team workflow through branches and PRs
Traceable manual vs AI-generated work through AI_USAGE_LOG.md
Final quality pass using AI review before submission
Working MVP with testable core functionality
