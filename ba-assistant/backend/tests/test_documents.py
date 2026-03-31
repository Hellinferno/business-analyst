"""Tests for document endpoints."""
import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_list_documents_unauthenticated(client):
    response = await client.get("/api/v1/documents")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_documents_empty(client, auth_headers):
    response = await client.get("/api/v1/documents", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "documents" in data or isinstance(data, list)


@pytest.mark.asyncio
async def test_generate_brd_unauthenticated(client):
    response = await client.post(
        "/api/v1/documents/brd",
        json={
            "project_name": "Test Project",
            "project_description": "A test project",
            "requirements": "Requirement 1\nRequirement 2",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_generate_brd_success(client, auth_headers):
    with patch(
        "app.services.ai_service.AIService.generate_brd",
        new_callable=AsyncMock,
        return_value="# BRD\n\nThis is the generated BRD content.",
    ):
        response = await client.post(
            "/api/v1/documents/brd",
            json={
                "project_name": "Test Project",
                "project_description": "A test project",
                "requirements": "Requirement 1\nRequirement 2",
            },
            headers=auth_headers,
        )
    assert response.status_code in (200, 201)
    data = response.json()
    assert "content" in data or "id" in data


@pytest.mark.asyncio
async def test_generate_user_stories_unauthenticated(client):
    response = await client.post(
        "/api/v1/documents/user-stories",
        json={
            "project_name": "Test Project",
            "requirements": "Users should be able to log in",
        },
    )
    assert response.status_code == 401
