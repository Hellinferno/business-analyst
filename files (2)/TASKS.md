# TASKS.md — Project Breakdown

## Priority Legend
- 🔴 P0 — Blocker / MVP critical
- 🟠 P1 — Important for launch
- 🟡 P2 — Nice-to-have / Post-MVP
- ✅ Done | 🔄 In Progress | ⬜ Todo

---

## Phase 1: Foundation (Week 1–2)

### Infrastructure & Auth
| # | Task | Priority | Status |
|---|---|---|---|
| 1.1 | Initialize monorepo (FastAPI backend + Next.js frontend) | 🔴 P0 | ⬜ Todo |
| 1.2 | Configure PostgreSQL + Supabase connection | 🔴 P0 | ⬜ Todo |
| 1.3 | Set up Alembic migrations | 🔴 P0 | ⬜ Todo |
| 1.4 | Implement JWT auth (login, refresh, logout) | 🔴 P0 | ⬜ Todo |
| 1.5 | Supabase OAuth integration (Google login) | 🟠 P1 | ⬜ Todo |
| 1.6 | User model + repository layer | 🔴 P0 | ⬜ Todo |
| 1.7 | Set up Redis + Celery worker | 🟠 P1 | ⬜ Todo |
| 1.8 | CI/CD pipeline (GitHub Actions → Vercel + Railway) | 🟠 P1 | ⬜ Todo |
| 1.9 | Environment config system (`pydantic-settings`) | 🔴 P0 | ⬜ Todo |

---

## Phase 2: Core AI Features (Week 3–5)

### Requirements Elicitation Module
| # | Task | Priority | Status |
|---|---|---|---|
| 2.1 | Design `elicitation` DB schema (sessions, questions) | 🔴 P0 | ⬜ Todo |
| 2.2 | Prompt template: stakeholder interview question generator | 🔴 P0 | ⬜ Todo |
| 2.3 | `POST /api/v1/elicitation/generate-questions` endpoint | 🔴 P0 | ⬜ Todo |
| 2.4 | Scope definition wizard prompt + endpoint | 🔴 P0 | ⬜ Todo |
| 2.5 | Ambiguity detection prompt (flags vague requirements) | 🟠 P1 | ⬜ Todo |

### Document Generation Engine
| # | Task | Priority | Status |
|---|---|---|---|
| 2.6 | Design `documents` DB schema | 🔴 P0 | ⬜ Todo |
| 2.7 | Prompt template: BRD generator | 🔴 P0 | ⬜ Todo |
| 2.8 | `POST /api/v1/documents/brd` endpoint | 🔴 P0 | ⬜ Todo |
| 2.9 | Prompt template: User story generator | 🔴 P0 | ⬜ Todo |
| 2.10 | `POST /api/v1/documents/user-stories` endpoint | 🔴 P0 | ⬜ Todo |
| 2.11 | Acceptance criteria auto-populator per user story | 🟠 P1 | ⬜ Todo |
| 2.12 | Document CRUD endpoints (GET, PATCH, DELETE) | 🔴 P0 | ⬜ Todo |

### Process Mapping Assistant
| # | Task | Priority | Status |
|---|---|---|---|
| 2.13 | Prompt template: As-Is / To-Be workflow analyzer | 🔴 P0 | ⬜ Todo |
| 2.14 | `POST /api/v1/process-maps/analyze` endpoint | 🔴 P0 | ⬜ Todo |
| 2.15 | Inefficiency highlighter prompt (redundant step detection) | 🟠 P1 | ⬜ Todo |

### UAT Checklist Generator
| # | Task | Priority | Status |
|---|---|---|---|
| 2.16 | Prompt template: UAT test case generator | 🔴 P0 | ⬜ Todo |
| 2.17 | `POST /api/v1/uat/checklist` endpoint | 🔴 P0 | ⬜ Todo |

---

## Phase 3: Frontend (Week 5–7)

### Core UI
| # | Task | Priority | Status |
|---|---|---|---|
| 3.1 | App shell layout (sidebar nav, header) | 🔴 P0 | ⬜ Todo |
| 3.2 | Auth pages (login, signup, forgot password) | 🔴 P0 | ⬜ Todo |
| 3.3 | Dashboard page (recent documents, quick-start CTA) | 🔴 P0 | ⬜ Todo |
| 3.4 | Elicitation wizard UI (multi-step form) | 🔴 P0 | ⬜ Todo |
| 3.5 | BRD generator UI (input form + result viewer) | 🔴 P0 | ⬜ Todo |
| 3.6 | User story generator UI | 🔴 P0 | ⬜ Todo |
| 3.7 | Process map input + results page | 🟠 P1 | ⬜ Todo |
| 3.8 | UAT checklist UI | 🟠 P1 | ⬜ Todo |
| 3.9 | Document viewer + edit mode | 🔴 P0 | ⬜ Todo |
| 3.10 | Streaming response display (loading states, skeleton UI) | 🟠 P1 | ⬜ Todo |

### Cross-Functional Communication
| # | Task | Priority | Status |
|---|---|---|---|
| 3.11 | Prompt: plain-English summary for business stakeholders | 🟠 P1 | ⬜ Todo |
| 3.12 | Prompt: technical spec summary for engineering teams | 🟠 P1 | ⬜ Todo |
| 3.13 | Communication drafts UI page | 🟠 P1 | ⬜ Todo |

---

## Phase 4: Polish & Launch (Week 8–9)

| # | Task | Priority | Status |
|---|---|---|---|
| 4.1 | End-to-end testing of all core flows | 🔴 P0 | ⬜ Todo |
| 4.2 | Error states and empty states for all pages | 🟠 P1 | ⬜ Todo |
| 4.3 | Rate limiting on AI endpoints (per user/hour) | 🟠 P1 | ⬜ Todo |
| 4.4 | Free vs Pro tier feature gating | 🟠 P1 | ⬜ Todo |
| 4.5 | Basic analytics (PostHog) — document generation events | 🟠 P1 | ⬜ Todo |
| 4.6 | Onboarding flow (first-run walkthrough) | 🟡 P2 | ⬜ Todo |
| 4.7 | Export documents as PDF or DOCX | 🟡 P2 | ⬜ Todo |
| 4.8 | Jira / Confluence export integration | 🟡 P2 | ⬜ Todo |

---

## Backlog (Post-MVP)

| # | Task | Priority |
|---|---|---|
| B1 | SQL/Excel query assistant | 🟡 P2 |
| B2 | Cost-Benefit Analysis template | 🟡 P2 |
| B3 | RACI matrix generator | 🟡 P2 |
| B4 | Multi-user collaboration + comment threads | 🟡 P2 |
| B5 | Requirements version history + diff view | 🟡 P2 |
| B6 | Document search using embeddings | 🟡 P2 |
