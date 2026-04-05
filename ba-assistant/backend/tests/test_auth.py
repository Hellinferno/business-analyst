"""Tests for authentication endpoints."""
import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "Test@Test@Password123!!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client, registered_user):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "differentuser",
            "password": "Test@Password123!",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_duplicate_username(client, registered_user):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "different@example.com",
            "username": "testuser",
            "password": "Test@Password123!",
        },
    )
    assert response.status_code == 400
    assert "already taken" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client, registered_user):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "Test@Test@Password123!!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client, registered_user):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "Wrong!@#12345"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email(client):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@example.com", "password": "Some!@#pass1"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_token_refresh(client, registered_user):
    # Login to get tokens
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "Test@Test@Password123!!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    refresh_token = login_response.json()["refresh_token"]

    # Use refresh token to get new access token
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_logout(client):
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
