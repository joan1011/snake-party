import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_game_lifecycle(client: AsyncClient):
    """
    Integration test covering a full user journey:
    1. Signup
    2. Login
    3. Update Profile
    4. Submit Game Score
    5. Verify Leaderboard
    6. Verify User Stats
    """
    
    # 1. Signup
    print("Step 1: Signup")
    signup_payload = {
        "username": "integration_user",
        "email": "integration@test.com",
        "password": "integration_pass"
    }
    response = await client.post("/api/auth/signup", json=signup_payload)
    assert response.status_code == 201
    user_data = response.json()["user"]
    assert user_data["username"] == "integration_user"
    user_id = user_data["id"]
    
    # 2. Login
    print("Step 2: Login")
    login_payload = {
        "email": "integration@test.com",
        "password": "integration_pass"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    token = response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Update Profile
    print("Step 3: Update Profile")
    update_payload = {
        "username": "integration_pro",
        "email": "integration@test.com"
    }
    response = await client.patch("/api/auth/me", json=update_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["username"] == "integration_pro"
    
    # 4. Submit Game Score
    print("Step 4: Submit Score")
    score_payload = {
        "score": 1500,
        "mode": "walls",
        "duration": 300
    }
    response = await client.post("/api/leaderboards/scores", json=score_payload, headers=headers)
    assert response.status_code == 200
    score_data = response.json()
    assert score_data["score"] == 1500
    assert score_data["username"] == "integration_pro" # Should reflect new username
    
    # 5. Verify Leaderboard
    print("Step 5: Verify Leaderboard")
    response = await client.get("/api/leaderboards?mode=walls")
    assert response.status_code == 200
    leaderboard = response.json()
    assert len(leaderboard) >= 1
    # Check if our entry is there
    entry = next((e for e in leaderboard if e["userId"] == user_id), None)
    assert entry is not None
    assert entry["score"] == 1500
    
    # 6. Verify User Stats
    print("Step 6: Verify User Stats")
    response = await client.get(f"/api/stats/user/{user_id}")
    assert response.status_code == 200
    stats = response.json()
    assert stats["highScore"] == 1500
    assert stats["gamesPlayed"] == 1
