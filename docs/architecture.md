# OneNext Architecture

## 1. System Overview

OneNext is a web application with a React frontend and Go backend.

The frontend collects messy daily input from the user. The backend compiles the input into a structured day plan using Groq. The frontend renders the plan as a focused next action, a timeline, insights, and reply drafts.

```text
User
  ↓
React Web App
  ↓ POST /api/v1/compile
Go Backend
  ↓
Groq LLM API
  ↓
Go validation + normalization
  ↓
React Result Screen
2. Design Principles
Keep the Browser Simple

The browser should not contain secret keys or LLM-specific logic.

Backend Owns the Contract

The Go backend is responsible for making sure the frontend receives predictable JSON.

Demo Must Not Fail

The backend includes demo fallback data. If the LLM fails, the presentation still works.

Small Internal Persistence

The MVP still avoids user accounts and external integrations. Accepted stretch persistence uses SQLite on the backend with an anonymous browser/device id stored in localStorage and sent as `X-OneNext-Client-ID`.

SQLite stores saved plans and OneNext-owned internal calendar events derived from compiled timelines.

Strict Typing

The data contract must be mirrored in:

Go structs
TypeScript interfaces

No any in TypeScript unless unavoidable and justified.

Avoid interface{} in Go unless unavoidable and justified.

3. Backend Architecture
/backend
├── cmd/api
│   └── main.go
├── internal/config
│   └── config.go
├── internal/models
│   └── plan.go
├── internal/services
│   ├── compiler.go
│   ├── groq_client.go
│   ├── prompt.go
│   └── demo.go
├── internal/handlers
│   ├── compile_handler.go
│   └── plan_handler.go
├── internal/storage
│   └── sqlite.go
└── internal/validation
    └── plan_validator.go
Backend Layers
Handler Layer

Responsible for:

HTTP request parsing
Basic request validation
Calling services
Returning JSON responses
Service Layer

Responsible for:

Prompt building
LLM calls
JSON parsing
Fallback handling
Validation Layer

Responsible for:

Required field checks
Enum checks
Timeline sanity checks
Debug warnings
Model Layer

Responsible for:

Request/response structs
Shared domain types

Storage Layer

Responsible for:

SQLite connection and migrations
Saved plan persistence
Calendar event persistence and range queries
4. Frontend Architecture
/web
├── src
│   ├── api
│   │   └── compileClient.ts
│   ├── models
│   │   └── plan.ts
│   ├── components
│   │   ├── InputPanel.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── FocusCard.tsx
│   │   ├── Timeline.tsx
│   │   ├── TimelineItem.tsx
│   │   ├── InsightList.tsx
│   │   ├── ReplyList.tsx
│   │   └── DebugPanel.tsx
│   ├── screens
│   │   ├── InputScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── storage
│   │   └── localPlanStorage.ts
│   └── App.tsx
5. State Management

MVP may use React state only.

Zustand is allowed if frontend complexity grows, but it is not required.

Minimum state:

interface AppState {
  rawInput: string;
  compiledPlan: CompiledPlan | null;
  isLoading: boolean;
  errorMessage: string | null;
}
6. API Boundary

The frontend sends:

{
  "raw_input": "..."
}

The backend returns:

{
  "summary": {},
  "focus": {},
  "timeline": [],
  "calendar_events": [],
  "replies": [],
  "insights": [],
  "debug": {}
}

The frontend must not assume optional backend fields unless defined in the contract.

Persistence endpoints require:

```text
X-OneNext-Client-ID: string
```

The frontend generates this id once and stores it in localStorage. This is not authentication; it is device-scoped demo persistence.

Saved timeline items become internal calendar events for the current planning date. Model-produced `calendar_events` become dated internal calendar events with backend-generated ids. External calendar sync remains out of scope.

7. LLM Integration

Groq is accessed only by the backend.

Environment variables:

GROQ_API_KEY=
GROQ_MODEL=
DEMO_MODE=false
DATABASE_PATH=data/onenext.db
APP_TIMEZONE=Europe/Istanbul

The backend should be designed around an LLMClient interface so the provider can be swapped later.

Example:

type LLMClient interface {
    Complete(ctx context.Context, prompt string) (string, error)
}

MVP implementation:

type GroqClient struct {
    APIKey string
    Model  string
}
8. Prompting Strategy

The prompt should demand valid JSON only.

The model should be instructed to:

Return Turkish visible text.
Accept Turkish/English mixed input.
Select one best next action.
Build a realistic timeline.
Use backend-provided date and internal calendar context when resolving relative dates.
Draft replies only when the input implies communication.
Flag missing information as insight warnings.
Avoid unsupported claims.
Add warnings to debug when assumptions are made.

For persisted plan creation, `POST /api/v1/plans` fetches upcoming OneNext calendar events for the anonymous device id, computes relative date hints in Go, and injects them into the prompt before calling Groq. This avoids extra model/tool rounds for phrases like "next Tuesday."
9. Fallback Strategy

Fallback is required.

Fallback triggers:

DEMO_MODE=true
Groq timeout
Groq error
Rate limit
JSON parse failure
Validation failure

Fallback response must set:

"fallback_used": true

inside debug.

10. Deployment

Preferred deployment:

Dockerfile for backend
Dockerfile for web
docker-compose.yml
Hetzner server
Simple deploy script

Example:

git pull
docker compose up -d --build
11. Security Notes
Never expose Groq API key in frontend.
Do not log full user input in production mode.
Do not store user data on server in MVP.
Add CORS configuration for frontend domain.
Use request size limits.
12. Quality Strategy

Before final submission:

Run frontend build.
Run backend build.
Test demo mode.
Test live Groq mode.
Run AI code review.
Record issues and fixes in AI_USAGE_LOG.md.

---

# ROADMAP.md

```md
# OneNext MVP Roadmap

## Phase 0: Setup

Goal: Create a stable repo structure.

Tasks:

- Create monorepo.
- Add `/backend`.
- Add `/web`.
- Add `PRD.md`.
- Add `ARCHITECTURE.md`.
- Add `ROADMAP.md`.
- Add `AI_USAGE_LOG.md`.
- Create initial branches.

Acceptance:

- Repo runs locally.
- Team understands folder ownership.

## Phase 1: Backend Skeleton

Owner: Backend Lead

Tasks:

- Initialize Go module.
- Add Gin or Fiber.
- Add `/api/v1/health`.
- Add `/api/v1/compile`.
- Add request/response structs.
- Add demo fallback response.
- Add environment config.

Acceptance:

- `GET /api/v1/health` returns OK.
- `POST /api/v1/compile` returns demo compiled plan.
- Response matches API contract.

## Phase 2: Frontend Skeleton

Owner: Frontend Developer 1

Tasks:

- Initialize React app.
- Add Tailwind.
- Create input screen.
- Create result screen placeholder.
- Add API client.
- Connect to backend demo response.

Acceptance:

- User can submit input.
- Frontend shows returned demo data.

## Phase 3: Result UI

Owner: Frontend Developer 1 + Frontend Developer 2

Tasks:

- Build summary card.
- Build focus card.
- Build timeline.
- Build collapsible insights.
- Build collapsible replies.
- Build hidden debug panel.
- Add localStorage save.

Acceptance:

- Full compiled plan renders.
- Last plan persists after refresh.
- Debug panel can be opened.

## Phase 4: LLM Integration

Owner: Backend Lead

Tasks:

- Add Groq client.
- Add prompt builder.
- Add JSON parsing.
- Add validation.
- Add fallback handling.
- Add timeout handling.

Acceptance:

- Live Groq mode returns valid plan.
- Invalid model output falls back safely.
- `debug.fallback_used` is accurate.

## Phase 5: Animation and Polish

Owner: Frontend Developer 2

Tasks:

- Add staged reveal.
- Add calm/minimal visual style.
- Add tasteful accent colors.
- Add copy button for replies.
- Add example input button.
- Improve loading state.

Acceptance:

- Result page has a clear “day compiling” feeling.
- Demo is visually understandable within 10 seconds.

## Phase 6: Team Workflow and Review

Owner: All

Tasks:

- Use pull requests.
- Review each PR.
- Record AI help in `AI_USAGE_LOG.md`.
- Run AI code review before final merge.
- Fix critical issues.

Acceptance:

- PR history shows team workflow.
- AI usage is traceable.
- Final review is documented.

## Phase 7: Deployment

Owner: Backend Lead + Team

Tasks:

- Add Dockerfiles.
- Add docker-compose.
- Add deploy script.
- Deploy to Hetzner.
- Test public URL.

Acceptance:

- App is accessible through public URL.
- Demo mode works on server.
- Live Groq mode works on server if API key is present.

## Stretch Goals

Only attempt after MVP is stable.

- Share card image export
- SQLite plan history
- Dark mode
- Better timeline animation
- Export full plan as text
- Save multiple plans locally
