# RULES.md — Coding Conventions

## General Principles

- **Clarity over cleverness.** Write code a junior dev can read in 30 seconds.
- **Explicit over implicit.** No magic. If it's not obvious, add a comment.
- **Fail loudly in dev, gracefully in prod.** Raise exceptions during development; return structured errors to users.

---

## Python (Backend)

### Naming
- Variables and functions: `snake_case`
- Classes: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Private methods/attributes: prefix with single underscore `_method_name`
- Async functions: name with verb prefix — `async def get_user()`, `async def create_document()`

### Files & Folders
- All filenames: `snake_case.py`
- One class per file for models and repositories
- Route files are named after the resource (plural): `documents.py`, `users.py`

### Types
- **Always use type hints.** No untyped function signatures.
- Use `X | None` (Python 3.10+ union syntax) over `Optional[X]`
- Never use `Dict`, `List`, `Tuple` from `typing` — use built-in `dict`, `list`, `tuple`

### Pydantic
- All request/response schemas live in a `schemas/` subfolder co-located with their route
- Schema names follow: `{Resource}{Action}Request` and `{Resource}{Action}Response`
  - Example: `DocumentCreateRequest`, `DocumentCreateResponse`

### Error Handling
- Never catch bare `Exception` — catch specific exception types
- All service-layer errors must raise custom exceptions defined in `app/core/exceptions.py`
- Never return `None` to signal an error — raise an exception
- Log errors with `structlog` — never use `print()` in production code

### What Never To Do (Python)
- ❌ Never use `import *`
- ❌ Never hardcode secrets, API keys, or URLs — use `config.py` backed by environment variables
- ❌ Never write raw SQL strings — use SQLAlchemy ORM or parameterized queries only
- ❌ Never put business logic in route handlers
- ❌ Never commit `.env` files

---

## TypeScript (Frontend)

### Naming
- Variables and functions: `camelCase`
- React components: `PascalCase`
- Files containing React components: `PascalCase.tsx` (e.g., `DocumentCard.tsx`)
- All other files: `camelCase.ts`
- Types and Interfaces: `PascalCase`, no `I` or `T` prefixes

### Types
- **Never use `any`.** Use `unknown` for truly unknown values and narrow with type guards.
- Prefer `type` over `interface` unless extending is required
- All API response types must live in `frontend/types/api.ts`
- Use `z.infer<typeof schema>` (Zod) as the source of truth for form data types

### Components
- Every component file exports a **single default export**
- Props type defined inline above component as `type {ComponentName}Props = {...}`
- Components must not contain direct `fetch()` calls — use custom hooks in `/hooks`
- Never use `useEffect` to sync state to state — derive values instead

### Comments
- TSDoc for all exported functions and components:
```ts
/** Generates a formatted user story string from structured input. */
export function formatUserStory(input: UserStoryInput): string { ... }
```
- Inline comments only for non-obvious logic

### What Never To Do (TypeScript)
- ❌ Never use `any`
- ❌ Never use `// @ts-ignore` — fix the type error
- ❌ Never access `localStorage` directly — use the `useLocalStorage` hook
- ❌ Never mutate props
- ❌ Never put API base URLs in component files — use `lib/api.ts`

---

## Git Conventions

- **Branch naming:** `feat/short-description`, `fix/short-description`, `chore/short-description`
- **Commit messages:** Conventional Commits format
  - `feat: add BRD generation endpoint`
  - `fix: handle empty stakeholder input in elicitation`
  - `chore: update dependencies`
- PRs require at least 1 approval before merging to `main`
- `main` is always deployable

---

## Prompt Engineering (AI Layer)

- All prompts are stored as Jinja2 templates in `/backend/prompts/`
- Prompt filenames: `{feature}_{action}.j2` — e.g., `brd_generate.j2`, `user_story_generate.j2`
- Every prompt must include: role definition, task description, output format specification, and an example
- Never concatenate user input directly into prompts — always use template variables with proper escaping
- Add a `<!-- version: X.X -->` comment header to every prompt file when modifying
