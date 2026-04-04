# BA Assistant Backend

FastAPI backend for the BA Assistant — AI-powered Business Analysis toolkit powered by Google Gemini.

## Stack

- **Python 3.11** with [uv](https://github.com/astral-sh/uv)
- **FastAPI** — async REST API
- **SQLAlchemy** (async) + **Alembic** — ORM and migrations
- **PostgreSQL** — primary database
- **Redis** — rate limiting and caching
- **Google Gemini 2.0 Flash** via LangChain — AI generation

## Setup

```bash
uv sync
cp .env.example .env   # fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Tests

```bash
uv run pytest --tb=short -q
```

See the [root README](../../README.md) for full project documentation.
