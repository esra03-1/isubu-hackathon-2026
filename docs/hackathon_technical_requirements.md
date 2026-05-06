# SolveX AI Hackathon 2026 Technical Requirements

Source: user-provided "Teknik Uygulama Sartnamesi" from nocodearea.com.

## Purpose

The hackathon expects teams to show AI-Augmented Development as an engineering process, not only as generated code. The repo should demonstrate version control discipline, team task ownership, AI tool usage, and review quality.

## Expected Product Output

The submitted solution may be a mobile app, web platform, desktop app, or end-to-end workflow product.

The core expectation is that the product minimizes manual effort and proves the usefulness of AI agents in the automation process.

## Team Structure

Teams have exactly 3 members.

Required roles:

- Lead Developer / Maintainer: manages the GitHub main repository, code standards, and PR approval process.
- Feature Developers: implement modular work from assigned issues, prepare tests, and submit code to the repo.

## GitHub Flow Requirements

- Use GitHub Flow.
- `main` represents the stable, deployable version.
- Do not push directly to `main`.
- Create a branch for every feature or fix.
- Preferred branch names:
  - `feature/task-name`
  - `fix/bug-name`
- Commit messages should be technical, concise, and present tense.
- Example: `feat: add user authentication layer`
- Merge only through Pull Requests.
- Every PR should receive at least one teammate code review before merge.

## AI-Augmented Development Requirements

AI tool usage is required for scoring.

Allowed tools include, but are not limited to:

- Cursor
- Google Antigravity
- Claude Code
- Similar AI-native development tools

Expected agent patterns:

- Plan Agent: before development, AI prepares architecture or roadmap planning. Store this as `ARCHITECTURE.md` or `ROADMAP.md` in the repo.
- Skills Agent: for specialized areas such as complex algorithms, security layers, or database optimization, AI acts as an expert developer.

## Documentation And Traceability

- Create GitHub Issues for tasks and assign them to developers.
- Track which parts were AI-assisted and which were manual.
- Traceability can be documented in PR descriptions or a lightweight `docs/ai_usage_log.md`.
- Code comments should only mention AI assistance when it is useful and relevant.
- Before submission, run a final AI review for refactoring, optimization, and bug detection.

## Practical Workflow For This Repo

- Keep AI traceability lightweight in `docs/ai_usage_log.md`.
- Keep source files clean unless an AI-assisted implementation note is genuinely useful.
- Use feature branches for implementation work.
- Keep the backend API contract aligned with `docs/prd.md`.
- Avoid adding behavior beyond the MVP without team agreement.
