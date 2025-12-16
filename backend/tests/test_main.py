from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_read_main():
    response = client.get("/docs")
    assert response.status_code == 200

def test_auth_flow():
    # 1. Signup
    signup_payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword"
    }
    response = client.post("/auth/signup", json=signup_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["username"] == "testuser"
    assert "token" in data
    token = data["token"]
    
    # 2. Login
    login_payload = {
        "email": "test@example.com",
        "password": "securepassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "token" in response.json()
    
    # 3. Get Me
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_leaderboard():
    response = client.get("/leaderboards")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_submit_score():
    # Setup user
    signup_payload = {
        "username": "scoreuser",
        "email": "score@example.com",
        "password": "pass"
    }
    r = client.post("/auth/signup", json=signup_payload)
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Submit
    score_payload = {
        "score": 5000,
        "mode": "walls",
        "duration": 120
    }
    response = client.post("/leaderboards/scores", json=score_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 5000
    assert data["username"] == "scoreuser"

def test_stats():
    response = client.get("/stats/global")
    assert response.status_code == 200
    data = response.json()
    assert "totalPlayers" in data

