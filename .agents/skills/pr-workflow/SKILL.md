---
name: pr-workflow
description: Use when committing, checking branch hygiene, or opening a PR for OneNext.
---

# OneNext PR Workflow Skill

Use only for commit/PR work. Keep context small.

## Checklist

1. Check branch and status:

```bash
git branch --show-current
git status --short
```

2. Never commit to `main`. Use `feature/task-name` or `fix/task-name`; if slash branches fail, use `feature-task-name`.
3. Do not revert unrelated teammate/user changes.
4. Run relevant checks:

```bash
go test ./...
npm run build
git diff --check
```

Skip unavailable checks with a short reason.

5. Use concise present-tense commits, e.g. `feat: add backend compile demo endpoint`.
6. For PRs, include only:

```md
Summary:
Tests:
AI traceability:
```

7. Keep AI notes in PR body or `docs/ai_usage_log.md`. Do not paste transcripts.
8. For full rules, read `docs/hackathon_technical_requirements.md` only if needed.
