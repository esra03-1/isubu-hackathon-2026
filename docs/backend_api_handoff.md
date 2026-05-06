# Backend API Handoff

This document is for frontend integration. It describes the backend endpoints needed for saved plans and the internal OneNext calendar.

## Base URL

Local backend default:

```text
http://localhost:8080
```

All API routes are under:

```text
/api/v1
```

## Device ID

There is no login. The frontend should generate one anonymous device id and keep it in `localStorage`.

Recommended key:

```text
onenext_client_id
```

Recommended format:

```ts
const CLIENT_ID_KEY = "onenext_client_id";

export function getOneNextClientId(): string {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;

  const id = `client_${crypto.randomUUID()}`;
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}
```

Send it on persistence/calendar requests:

```text
X-OneNext-Client-ID: client_xxx
```

`POST /compile` does not require this header. The app's main saved-flow should use `POST /plans`.

## Main Submit Flow

Use this for the primary UI submit action:

```text
POST /api/v1/plans
```

Headers:

```text
Content-Type: application/json
X-OneNext-Client-ID: client_xxx
```

Request:

```json
{
  "raw_input": "Tomorrow I have a quiz and need to reply to Ali.",
  "planning_date": "2026-05-12"
}
```

`planning_date` is optional. Use `YYYY-MM-DD` when the user is planning a selected calendar day. If omitted, the backend defaults to the server's current local date.

Response:

```json
{
  "id": "plan_backend_id",
  "client_id": "client_xxx",
  "raw_input": "Tomorrow I have a quiz and need to reply to Ali.",
  "planning_date": "2026-05-12",
  "compiled_plan": {
    "summary": {},
    "focus": {},
    "timeline": [],
    "calendar_events": [],
    "replies": [],
    "insights": [],
    "debug": {}
  },
  "created_at": "2026-05-06T10:00:00Z"
}
```

Render `response.compiled_plan` in the result screen.

Curl:

```sh
curl -sS http://localhost:8080/api/v1/plans \
  -H "Content-Type: application/json" \
  -H "X-OneNext-Client-ID: client_demo" \
  -d '{"raw_input":"Tomorrow I have a quiz and need to reply to Ali.","planning_date":"2026-05-12"}' \
  | jq
```

Curl with default planning date:

```sh
curl -sS http://localhost:8080/api/v1/plans \
  -H "Content-Type: application/json" \
  -H "X-OneNext-Client-ID: client_demo" \
  -d '{"raw_input":"Tomorrow I have a quiz and need to reply to Ali."}' \
  | jq
```

## Plan History

Use this to render saved plan history.

```text
GET /api/v1/plans
X-OneNext-Client-ID: client_xxx
```

Response:

```json
{
  "plans": [
    {
      "id": "plan_backend_id",
      "headline": "Bugunun en iyi ilk hamlesi...",
      "focus": "Hackathon fikrini netlestir",
      "created_at": "2026-05-06T10:00:00Z"
    }
  ]
}
```

Curl:

```sh
curl -sS http://localhost:8080/api/v1/plans \
  -H "X-OneNext-Client-ID: client_demo" \
  | jq
```

## Fetch One Saved Plan

Use this when clicking a history item.

```text
GET /api/v1/plans/:id
X-OneNext-Client-ID: client_xxx
```

Response shape is the same as `POST /api/v1/plans`.

Curl:

```sh
curl -sS http://localhost:8080/api/v1/plans/plan_backend_id \
  -H "X-OneNext-Client-ID: client_demo" \
  | jq
```

## Calendar Range

Use this for day, week, and month calendar views.

```text
GET /api/v1/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
X-OneNext-Client-ID: client_xxx
```

Response:

```json
{
  "events": [
    {
      "id": "event_backend_id",
      "client_id": "client_xxx",
      "plan_id": "plan_backend_id",
      "date": "2026-05-12",
      "time": "09:00",
      "title": "Math quiz",
      "type": "academic",
      "source": "ai_calendar_event",
      "created_at": "2026-05-06T10:00:00Z"
    }
  ]
}
```

Event sources:

- `compiled_plan`: event was derived from `timeline[]` for the selected `planning_date` or the backend's current local date if omitted.
- `ai_calendar_event`: event was explicitly produced by the AI in `calendar_events[]`.

Curl:

```sh
curl -sS "http://localhost:8080/api/v1/calendar?start=2026-05-06&end=2026-05-31" \
  -H "X-OneNext-Client-ID: client_demo" \
  | jq
```

## Non-Persistent Compile

This endpoint remains available for simple testing.

```text
POST /api/v1/compile
```

It does not save plans and does not use device calendar memory.

The app's main flow should prefer `POST /api/v1/plans`.

## TypeScript Shapes

```ts
export type DominantPressure =
  | "deadline"
  | "social"
  | "errand"
  | "academic"
  | "work"
  | "mixed";

export type Urgency = "high" | "medium" | "low";
export type TimelineType = "work" | "errand" | "meeting" | "academic" | "personal";
export type InsightType = "prep" | "risk";
export type Severity = "high" | "medium" | "low";
export type CalendarEventSource = "compiled_plan" | "ai_calendar_event";

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

export interface CompiledCalendarEvent {
  date: string;
  time: string;
  title: string;
  type: TimelineType;
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
  severity: Severity;
}

export interface DebugInfo {
  model: string;
  raw_model_output: string;
  fallback_used: boolean;
  warnings: string[];
}

export interface CompiledPlan {
  summary: Summary;
  focus: FocusAction;
  timeline: TimelineItem[];
  calendar_events: CompiledCalendarEvent[];
  replies: ReplyDraft[];
  insights: Insight[];
  debug: DebugInfo;
}

export interface SavedPlan {
  id: string;
  client_id: string;
  raw_input: string;
  planning_date: string;
  compiled_plan: CompiledPlan;
  created_at: string;
}

export interface PlanSummary {
  id: string;
  headline: string;
  focus: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  client_id: string;
  plan_id: string;
  date: string;
  time: string;
  title: string;
  type: TimelineType;
  source: CalendarEventSource;
  created_at: string;
}
```

## Error Shape

Errors use:

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

Common frontend-relevant errors:

- `missing_client_id`: persistence/calendar endpoint was called without `X-OneNext-Client-ID`.
- `invalid_client_id`: device id contains unsupported characters.
- `invalid_request`: request body was invalid JSON.
- `empty_raw_input`: input was empty.
- `raw_input_too_long`: input exceeded backend limit.
- `invalid_planning_date`: `planning_date` did not use `YYYY-MM-DD`.
- `invalid_date_range`: calendar start/end date was missing or malformed.

## Frontend Notes

The main plan payload already includes everything needed for the result screen:

- `timeline[]` for the day plan
- `insights[]` for the insights card/list
- `replies[]` for reply drafts
- `debug` for the debug panel

No extra insights or replies endpoints are required for the demo flow.

## Local E2E Test

With the backend running:

```sh
./test.sh
```

Against a non-default port:

```sh
BASE_URL=http://127.0.0.1:18080 ./test.sh
```
