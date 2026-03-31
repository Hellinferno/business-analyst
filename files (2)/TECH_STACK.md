# TECH_STACK.md — Technical Decisions

## Language & Runtime

| Layer | Technology | Version |
|---|---|---|
| Backend | Python | 3.11 |
| Frontend | TypeScript | 5.x |
| Runtime (Frontend) | Node.js | 20 LTS |

---

## Frameworks

### Backend
- **FastAPI** — Primary API framework. Chosen for async support, automatic OpenAPI docs, and Pydantic validation.
- **Pydantic v2** — Data validation and settings management.
- **LangChain** — LLM orchestration layer for chaining prompts, memory, and tool calls.
- **Celery + Redis** — Background task queue for long-running document generation jobs.

### Frontend
- **Next.js 14** (App Router) — React framework with server components and file-based routing.
- **Tailwind CSS** — Utility-first styling.
- **shadcn/ui** — Component library built on Radix UI primitives.
- **React Hook Form + Zod** — Form management and client-side validation.
- **TanStack Query (React Query)** — Server state management and caching.

---

## AI / LLM

- **Primary Model:** Anthropic Claude (claude-sonnet-4-20250514) via API
- **Orchestration:** LangChain (Python SDK)
- **Prompt Storage:** Version-controlled `.prompt` files in `/prompts` directory
- **Embeddings (post-MVP):** OpenAI `text-embedding-3-small` for document similarity search

---

## Database & ORM

| Purpose | Technology |
|---|---|
| Primary database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 (async) with Alembic migrations |
| Cache / Queue broker | Redis 7 |
| File/document storage | AWS S3 (or Cloudflare R2) |

---

## Auth

- **Approach:** JWT-based authentication with refresh tokens
- **Provider:** Supabase Auth (handles OAuth via Google/GitHub + magic link email)
- **Session storage:** HttpOnly cookies (no localStorage for tokens)
- **Authorization:** Role-based access control (RBAC) — roles: `admin`, `pro_user`, `free_user`

---

## Hosting & Deployment

| Component | Platform |
|---|---|
| Backend API | Railway (prod) / Docker locally |
| Frontend | Vercel |
| Database | Supabase (managed PostgreSQL) |
| Redis | Upstash |
| File Storage | Cloudflare R2 |
| CI/CD | GitHub Actions |

---

## Dev Tooling

- **Package manager:** `uv` (Python), `pnpm` (Node)
- **Linting:** `ruff` (Python), `ESLint` (TypeScript)
- **Formatting:** `black` (Python), `prettier` (TypeScript)
- **Testing:** `pytest` + `httpx` (backend), `Vitest` + `Testing Library` (frontend)
- **Type checking:** `mypy` (Python), `tsc --noEmit` (TypeScript)
