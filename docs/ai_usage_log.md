# AI Usage Log

This file tracks meaningful AI-assisted work for SolveX AI Hackathon 2026 without storing full chat transcripts or prompt dumps.

## 2026-05-06

### Product Planning
- Tool used: ChatGPT website.
- AI-assisted work: MVP idea refinement, hackathon requirement interpretation, product scope, and planning around OneNext.
- Human review: Scope was checked against the hackathon judging form and narrowed to the documented MVP: messy daily input to one next action, timeline, insights, and reply drafts.

### Repository Planning
- Tool used: Codex.
- AI-assisted work: Reviewed `docs/hackathon_context.md`, `docs/prd.md`, and `docs/architecture.md` to identify required MVP pieces and likely next implementation order.
- Human review: Team will use the docs as the source of truth and avoid adding unapproved behavior beyond the MVP contract.

### Workflow Setup
- Tool used: Codex.
- AI-assisted work: Added a repo-local PR workflow skill under `.agents/skills/pr-workflow/` so AI tools and teammates can follow the same branch, commit, check, and PR process.
- Human review: Workflow was based on the user-provided technical requirements and kept separate from product source code.

### Backend Skeleton
- Tool used: Codex.
- AI-assisted work: Scaffolded the Go/Gin backend skeleton with health and compile endpoints, PRD-shaped structs, request validation, and demo fallback JSON.
- Human review: Implementation should be reviewed against `docs/prd.md` before adding Groq integration.

### Backend Tests & Router
- Tool used: Google Antigravity.
- AI-assisted work: Extracted Gin router into `internal/api/router.go` and implemented table-driven tests in `router_test.go` to lock in the PRD contract and demo fallback.
- Human review: Ensured tests pass and keep architecture modular before LLM integration.

### Groq LLM Integration
- Tool used: Google Antigravity.
- AI-assisted work: Built `groq_client.go` and `compiler.go` for LLM interaction. Designed `prompt.go` with the strict JSON schema required by the PRD. Connected integration to `compile_handler.go` with automatic fallback to `DemoPlan` on failure.
- Human review: Tested locally via curl; noticed initial LLM schema mismatch, prompting an AI fix to strictly enforce the JSON format. Verified successful end-to-end integration.

### Frontend Skeleton & API Client
- Tool used: Google Antigravity.
- AI-assisted work: Assisted with Vite React TS setup. Generated root `.gitignore`, TypeScript API interfaces mirroring Go structs (`types.ts`), and the `compileDay` fetch client. Built the initial `App.tsx` Input Screen with Tailwind CSS.
- Human review: Frontend developer verified the Vite build and will take over styling and result screen rendering.

### Device Persistence & Internal Calendar
- Tool used: Codex.
- AI-assisted work: Planned and implemented anonymous device-based SQLite persistence on branch `feature/backend-persistence-calendar`. Added saved plan endpoints, internal calendar range reads, calendar-aware prompt context for persisted compiles, and an extended AI output contract with no-id `calendar_events` that are persisted with backend-generated ids. Added backend tests and a curl-based `test.sh` e2e script.
- Human review: User approved the scope as internal app calendar memory rather than external calendar integration or login, approved using the system Go toolchain, and confirmed AI should not generate persistent calendar event ids.
- Verification: Ran `go test ./...`, `./test.sh`, and `git diff --check` successfully.

### Backend API Handoff
- Tool used: Codex.
- AI-assisted work: Added `docs/backend_api_handoff.md` with frontend integration instructions, curl examples, TypeScript response shapes, device id behavior, and endpoint mapping.
- Human review: User asked for a small API handoff doc so frontend teammates can integrate without reading backend code.

### Planning Date Support
- Tool used: Codex.
- AI-assisted work: Added optional `planning_date` support to `POST /api/v1/plans`, updated prompt context so selected-day planning is explicit, added backend tests for valid/invalid/default date behavior, and updated backend handoff documentation.
- Human review: User approved keeping this change scoped to planning-date correctness and not adding new delete or manual calendar editing behavior.

### Timeline Duration & Break-Aware Prompting
- Tool used: Codex.
- AI-assisted work: Added `timeline[].duration` to backend/frontend contract surfaces and updated the planning prompt so generated timelines stay mindful of short breaks, meals, and context switching instead of packing tasks back-to-back.
- Human review: User approved adding timeline durations to support the demo UI and asked for break-aware prompting without introducing separate break event persistence.
