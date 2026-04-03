# API Conventions

## REST Endpoints
- Use plural nouns for resources: `/users`, `/projects`
- Use HTTP verbs correctly: GET, POST, PUT/PATCH, DELETE
- Return appropriate status codes (200, 201, 400, 401, 403, 404, 500)
- Version the API: `/api/v1/...`

## Request / Response
- Use JSON for request and response bodies
- Use camelCase for JSON field names
- Always return a consistent error shape:
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Resource not found" } }
  ```

## Authentication
- Use Bearer token in `Authorization` header
- Never expose secrets or tokens in URLs or logs

## Pagination
- Use `page` and `limit` query params
- Return total count in response: `{ "data": [...], "total": 100 }`
