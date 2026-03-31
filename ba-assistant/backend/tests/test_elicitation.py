"""Tests for elicitation endpoints."""
import pytest
from unittest.mock import AsyncMock, patch

MOCK_QUESTIONS = [
    {
        "category": "Business Context & Goals",
        "question": "What are the primary business objectives?",
        "rationale": "Understand strategic alignment",
    }
]


@pytest.mark.asyncio
async def test_generate_questions_unauthenticated(client):
    response = await client.post(
        "/api/v1/elicitation/generate-questions",
        json={
            "project_name": "Test Project",
            "project_description": "A test project",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_generate_questions_success(client, auth_headers):
    import json

    with patch(
        "app.services.ai_service.AIService.generate_elicitation_questions",
        new_callable=AsyncMock,
        return_value=json.dumps(MOCK_QUESTIONS),
    ):
        response = await client.post(
            "/api/v1/elicitation/generate-questions",
            json={
                "project_name": "Test Project",
                "project_description": "A test project for elicitation testing",
                "stakeholders": "Product Manager, Engineering Lead",
            },
            headers=auth_headers,
        )
    assert response.status_code in (200, 201)
    data = response.json()
    assert "questions" in data or "session_id" in data


@pytest.mark.asyncio
async def test_list_sessions_authenticated(client, auth_headers):
    response = await client.get("/api/v1/elicitation/sessions", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_ambiguity_check_unauthenticated(client):
    response = await client.post(
        "/api/v1/elicitation/ambiguity-check",
        json={"requirements": "The system should be fast and easy to use"},
    )
    assert response.status_code == 401
