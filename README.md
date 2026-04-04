# BA Assistant

[![CI/CD](https://github.com/Hellinferno/business-analyst/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Hellinferno/business-analyst/actions/workflows/ci-cd.yml)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![Next.js 14](https://img.shields.io/badge/next.js-14-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

AI-powered toolkit that accelerates Business Analysis work — from requirements elicitation and scope definition to ambiguity checking and UAT test-case generation, powered by Google Gemini.

---

## Features

| Feature | Description |
| ------- | ----------- |
| Requirements Elicitation | Generate targeted stakeholder interview questions from a project brief |
| Scope Wizard | Produce a structured scope document with in-scope / out-of-scope / assumptions |
| Ambiguity Checker | Score requirements quality and surface ambiguous terms, gaps, conflicts, and testability issues |
| BRD Generator | Draft a full Business Requirements Document from structured inputs |
| User Story Generator | Convert requirements into acceptance-criteria-ready user stories |
| UAT Panel | Generate UAT test cases from BRD content |
| Process Map Analyzer | Analyse process diagrams and highlight inefficiencies with improvement recommendations |

---

## Architecture

```text
                    ┌─────────────────────┐
                    │   Next.js Frontend  │  :3000
                    │  (React + Tailwind) │
                    └────────┬────────────┘
                             │ REST / JSON
                    ┌────────▼────────────┐
                    │   FastAPI Backend   │  :8000
                    │  (Python 3.11 + uv) │
                    └──┬──────────┬───────┘
                       │          │
           ┌───────────▼──┐  ┌────▼──────────┐
           │  PostgreSQL  │  │  Redis (cache/ │
           │  (SQLAlchemy)│  │   rate-limit)  │
           └──────────────┘  └────────────────┘
                       │
           ┌───────────▼──────────┐
           │  Google Gemini 2.0   │
           │  (via LangChain)     │
           └──────────────────────┘
```

---

## Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend  | FastAPI, Python 3.11, uv, SQLAlchemy (async)             |
| Database | PostgreSQL 16                                            |
| Cache    | Redis 7                                                  |
| AI       | Google Gemini 2.0 Flash via LangChain                    |
| Auth     | JWT (access + refresh tokens)                            |
| Deploy   | Railway (backend) · Vercel (frontend)                    |

---

## Project Structure

```text
ba-assistant/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/   # FastAPI routers (auth, documents, elicitation, process-maps, uat)
│   │   ├── core/            # Config, security, rate limiter, dependencies
│   │   ├── db/              # SQLAlchemy models, repositories, Alembic migrations
│   │   └── services/        # AI service (Gemini) + Jinja2 prompt templates
│   ├── prompts/             # Prompt templates (.j2)
│   ├── tests/               # pytest test suite
│   └── pyproject.toml
└── frontend/
    ├── app/                 # Next.js App Router pages
    ├── components/
    │   ├── features/        # Feature panels (ElicitationPanel, BRDGenerator, …)
    │   └── ui/              # Reusable primitives (shadcn/ui)
    ├── hooks/               # Custom React hooks (useElicitation, useDocuments, …)
    ├── lib/                 # Centralized API client, utilities
    └── types/               # TypeScript type definitions
```

---

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/Hellinferno/business-analyst.git
cd business-analyst

# Configure environment
cp ba-assistant/backend/.env.example ba-assistant/backend/.env
# Edit ba-assistant/backend/.env with your credentials

docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

### Manual Setup

#### Backend

```bash
cd ba-assistant/backend
pip install uv
uv sync
cp .env.example .env          # fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd ba-assistant/frontend
pnpm install
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL=http://localhost:8000
pnpm dev
```

---

## Environment Configuration

### Backend (`ba-assistant/backend/.env`)

| Variable         | Required | Description                                      |
| ---------------- | -------- | ------------------------------------------------ |
| `DATABASE_URL`   | Yes      | PostgreSQL async URL (`postgresql+asyncpg://…`)  |
| `GEMINI_API_KEY` | Yes      | Google AI Studio API key                         |
| `JWT_SECRET`     | Yes      | Random secret string, minimum 32 characters      |
| `REDIS_URL`      | No       | Redis URL (default: `redis://localhost:6379/0`)  |
| `ENVIRONMENT`    | No       | `development` (default) or `production`          |

### Frontend (`ba-assistant/frontend/.env.local`)

| Variable              | Required | Description                                         |
| --------------------- | -------- | --------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend base URL (default: `http://localhost:8000`) |

---

## Running Tests

Run backend tests:

```bash
cd ba-assistant/backend
uv run pytest --tb=short -q
```

Run frontend checks:

```bash
cd ba-assistant/frontend
pnpm typecheck   # TypeScript type checking
pnpm lint        # ESLint
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`
Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

| Method | Endpoint                              | Auth | Description                    |
| ------ | ------------------------------------- | ---- | ------------------------------ |
| POST   | `/auth/register`                      | No   | Register new user              |
| POST   | `/auth/login`                         | No   | Obtain JWT access token        |
| POST   | `/auth/refresh`                       | Yes  | Refresh access token           |
| POST   | `/elicitation/generate-questions`     | Yes  | Generate stakeholder questions |
| POST   | `/elicitation/scope-wizard`           | Yes  | Generate scope definition      |
| POST   | `/elicitation/ambiguity-check`        | Yes  | Check requirements for issues  |
| POST   | `/documents/brd`                      | Yes  | Generate BRD document          |
| POST   | `/documents/user-stories`             | Yes  | Generate user stories          |
| POST   | `/documents/acceptance-criteria`      | Yes  | Generate acceptance criteria   |
| GET    | `/documents/`                         | Yes  | List user documents            |
| GET    | `/documents/{id}`                     | Yes  | Get a document                 |
| POST   | `/process-maps/analyze`               | Yes  | Analyse process flow           |
| POST   | `/uat/checklist`                      | Yes  | Generate UAT checklist         |

---

## Deployment

### Backend — Railway

```bash
npm install -g @railway/cli
railway login
railway up --service ba-assistant-backend
```

Required Railway secrets: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `GEMINI_API_KEY`.

### Frontend — Vercel

```bash
npm install -g vercel
vercel --prod
```

Required Vercel environment variable: `NEXT_PUBLIC_API_URL` pointing to the deployed backend.

---

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Ensure the test suite passes locally before opening a PR (`uv run pytest` + `pnpm typecheck`).
3. Follow code style: `ruff` + `black` for Python, ESLint + TypeScript strict mode for the frontend.
4. Open a pull request against `main` with a clear description and any relevant issue numbers.

---

## License

MIT — see [LICENSE](LICENSE).
