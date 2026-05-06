# OneNext Hackathon Overview

## Event Details

**Event:** SolveX AI Hackathon 2026
**Challenge:** Build a software solution that reduces a repetitive daily task by at least **50%** using AI and software technologies.

---

## Project: OneNext

OneNext is a web application designed to eliminate **decision fatigue** by converting unstructured daily inputs into a prioritized, executable plan.

### Core Transformation

**Input:** Chaotic text blocks (mixed Turkish/English messages, school tasks, work reminders, errands).
**Output:**
    One singular **next action**.
    A chronological timeline.
    Preparation/risk insights.
    Reply drafts.
    Debug output for testing.

### Target Users

Overwhelmed students.
Professionals with decision fatigue.
Individuals with high-volume, small-scale obligations.

---

## Technical Specifications (MVP)

### Technology Stack

**Frontend:** React (Web).
**Backend:** Go.
**LLM:** Groq API (Backend-to-LLM only).
**Data:** `localStorage` for plan persistence; strict JSON API contracts.

### Scope Constraints (Out of Scope)

No Authentication/Database (unless MVP core is finished).
No Native Mobile App.
No Third-party integrations (Calendar, Gmail, WhatsApp).
No OCR, Voice Input, or Browser Extensions.
No Recurring tasks or Multi-user collaboration.

---

## Judging & Development Standards

### 1. AI-Augmented Development

Documentation must verify AI assistance in:
Architecture planning (`ARCHITECTURE.md`).
Implementation and code quality review (`AI_USAGE_LOG.md`).
Roadmap management (`ROADMAP.md`).

### 2. Team Workflow

Clear task distribution.
Managed Pull Requests (PRs).
Mandatory code reviews before merging.

### 3. Development Priorities

1. Functional backend demo response.
2. Frontend rendering of demo data.
3. Live Groq integration.
4. Fallback safety mechanisms.
5. UI Polish and animation.
6. Final documentation.

---

## Product Design & Tone

**Vibe:** Calm, minimal, Apple-like focus.
**UI Elements:** Clean cards, soft shadows, tasteful accents.
**Constraint:** Avoid "Enterprise SaaS" clutter or generic chatbot interfaces.

---

## Agent Instructions
Adhere strictly to the `PRD.md` API contract.
Do not modify backend response structures without team consensus.
Prioritize MVP delivery over architectural abstraction.
Maintain the `AI_USAGE_LOG.md` for all significant AI contributions.
