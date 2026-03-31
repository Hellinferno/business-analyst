# ARCHITECTURE.md — System Design

## High-Level Overview

```
┌─────────────────────────────────────────────────┐
│                  Next.js Frontend                │
│         (App Router, React Server Components)    │
└────────────────────┬────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────┐
│               FastAPI Backend (Python)           │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth Layer │  │  Routes  │  │  Services  │  │
│  └─────────────┘  └──────────┘  └────────────┘  │
│                        │                         │
│              ┌─────────▼──────────┐              │
│              │  LangChain / AI    │              │
│              │  Orchestration     │◄── Claude API│
│              └─────────┬──────────┘              │
│                        │                         │
│  ┌─────────┐  ┌────────▼──────┐  ┌───────────┐  │
│  │  Redis  │  │  PostgreSQL   │  │  S3 / R2  │  │
│  │ (Queue) │  │  (Supabase)   │  │ (Storage) │  │
│  └─────────┘  └───────────────┘  └───────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Folder Structure

```
ba-assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── documents.py
│   │   │   │   │   ├── elicitation.py
│   │   │   │   │   ├── process_maps.py
│   │   │   │   │   └── uat.py
│   │   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── db/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── session.py
│   │   ├── services/
│   │   │   ├── document_service.py
│   │   │   ├── ai_service.py
│   │   │   └── process_service.py
│   │   ├── workers/
│   │   └── main.py
│   ├── prompts/
│   ├── tests/
│   └── pyproject.toml
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── elicitation/
│   │   └── process-maps/
│   ├── components/
│   │   ├── ui/
│   │   └── features/
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── hooks/
│   └── types/
│
├── docker-compose.yml
└── .github/workflows/
```

---

## API Design

- **Style:** REST (JSON)
- **Versioning:** URL path prefix — `/api/v1/`
- **Auth header:** `Authorization: Bearer <token>`
- **Error format:**
```json
{ "error": "VALIDATION_ERROR", "message": "Field 'title' is required", "status": 422 }
```

### Core Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Email/password or OAuth login |
| `POST` | `/api/v1/elicitation/generate-questions` | Generate stakeholder interview questions |
| `POST` | `/api/v1/documents/brd` | Generate BRD from raw input |
| `POST` | `/api/v1/documents/user-stories` | Generate user stories |
| `POST` | `/api/v1/process-maps/analyze` | Analyze As-Is flow for inefficiencies |
| `POST` | `/api/v1/uat/checklist` | Generate UAT checklist from requirements |
| `GET` | `/api/v1/documents/{id}` | Retrieve saved document |
| `PATCH` | `/api/v1/documents/{id}` | Update document |

---

## Data Flow — Document Generation

```
User Input (raw notes)
        │
        ▼
FastAPI Route → validates input (Pydantic)
        │
        ▼
DocumentService → formats prompt from template
        │
        ▼
AIService → sends to Claude API via LangChain
        │
  (if long-running)
        ▼
Celery Task (async) → saves result to PostgreSQL
        │
        ▼
WebSocket / Polling → streams result back to frontend
        │
        ▼
User sees generated document
```

---

## Key Design Patterns

- **Repository Pattern** — All database access is abstracted behind repository classes. Services never call the ORM directly.
- **Service Layer** — Business logic lives in `/services`, never in route handlers.
- **Dependency Injection** — FastAPI's `Depends()` is used for auth, DB sessions, and service instances.
- **Prompt-as-Config** — Prompt templates are `.j2` (Jinja2) files versioned in `/prompts`, not hardcoded in Python.
- **Optimistic UI** — Frontend shows a loading skeleton immediately; result streams in via polling/WebSocket.
