import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_read_main(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Party API", "docs": "/docs"}

@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient):
    # 1. Signup
    signup_payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword"
    }
    response = await client.post("/api/auth/signup", json=signup_payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["user"]["username"] == "testuser"
    assert "token" in data
    token = data["token"]
    
    # 2. Login
    login_payload = {
        "email": "test@example.com",
        "password": "securepassword"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "token" in response.json()
    
    # 3. Get Me
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_leaderboard(client: AsyncClient):
    response = await client.get("/api/leaderboards")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_submit_score(client: AsyncClient):
    # Setup user
    signup_payload = {
        "username": "scoreuser",
        "email": "score@example.com",
        "password": "pass"
    }
    r = await client.post("/api/auth/signup", json=signup_payload)
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Submit
    score_payload = {
        "score": 5000,
        "mode": "walls",
        "duration": 120
    }
    response = await client.post("/api/leaderboards/scores", json=score_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 5000
    assert data["username"] == "scoreuser"

@pytest.mark.asyncio
async def test_stats(client: AsyncClient):
    response = await client.get("/api/stats/global")
    assert response.status_code == 200
    data = response.json()
    assert "totalPlayers" in data
