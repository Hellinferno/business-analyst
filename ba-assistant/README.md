# BA Assistant

AI-powered Business Analyst assistant that automates repetitive BA tasks using Google Gemini.

## Features

- **BRD Generator** — Auto-generate Business Requirements Documents from raw requirements
- **Requirements Elicitation** — Generate stakeholder interview questions, define scope, detect ambiguities
- **User Stories** — Generate Agile user stories and Given-When-Then acceptance criteria
- **Process Map Analysis** — Analyse As-Is processes for inefficiencies and recommend To-Be flows
- **UAT Checklists** — Generate comprehensive User Acceptance Testing checklists

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.11, SQLAlchemy (async), Alembic |
| AI | Google Gemini API via LangChain |
| Database | PostgreSQL (Supabase) |
| Cache | Redis |
| Auth | JWT (access + refresh tokens) |

## Project Structure

```
ba-assistant/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/routes/    # Auth, documents, elicitation, process-maps, uat
│   │   ├── core/             # Config, security, dependencies
│   │   ├── db/               # SQLAlchemy models + repositories
│   │   └── services/         # AI service (Gemini)
│   ├── prompts/              # Jinja2 AI prompt templates
│   ├── alembic/              # Database migrations
│   └── tests/                # pytest test suite
└── frontend/         # Next.js 14 frontend
    ├── app/          # App Router pages
    ├── components/   # UI + feature components
    ├── hooks/        # Custom React hooks
    └── types/        # TypeScript type definitions
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional, for full stack)
- [Supabase](https://supabase.com) project (free tier works)
- [Google AI Studio](https://aistudio.google.com) API key (Gemini)

## Quick Start

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd ba-assistant
```

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values:
#   DATABASE_URL   — Supabase PostgreSQL connection string
#   GEMINI_API_KEY — Google Gemini API key
#   JWT_SECRET     — Any random secret string (32+ chars)
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000  (default, no change needed for local)
```

### 2. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 3. Run manually

**Backend:**
```bash
cd backend
pip install -e ".[dev]"
alembic upgrade head          # Run database migrations
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy the connection string
3. Replace `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
4. Run migrations: `cd backend && alembic upgrade head`

## Running Tests

```bash
cd backend
pip install -e ".[dev]"
pytest tests/ -v
```

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `REDIS_URL` | No | Redis URL (default: `redis://localhost:6379/0`) |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `ENVIRONMENT` | No | `development` or `production` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (default: `http://localhost:8000`) |

## API Overview

All endpoints are under `/api/v1/`. See interactive docs at `/docs` (development only).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/documents/brd` | Generate BRD |
| POST | `/documents/user-stories` | Generate user stories |
| POST | `/documents/acceptance-criteria` | Generate acceptance criteria |
| GET | `/documents` | List user's documents |
| POST | `/elicitation/generate-questions` | Generate interview questions |
| POST | `/elicitation/scope-wizard` | Define project scope |
| POST | `/elicitation/ambiguity-check` | Check requirements for ambiguity |
| POST | `/process-maps/analyze` | Analyse process flow |
| POST | `/uat/checklist` | Generate UAT checklist |
