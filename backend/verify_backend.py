import asyncio
import httpx

BASE_URL = "http://localhost:8000/api"

async def test_backend():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        # Signup
        signup_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123"
        }
        print("Testing Signup...")
        resp = await client.post("/auth/signup", json=signup_data)
        if resp.status_code == 201:
            print("Signup Success:", resp.json())
            token = resp.json()["token"]
        elif resp.status_code == 409:
             print("User already exists, trying login")
             resp_login = await client.post("/auth/login", json={"email": "test@example.com", "password": "securepassword123"})
             token = resp_login.json()["token"]
        else:
            print("Signup Failed:", resp.status_code, resp.text)
            return

        # Login
        print("\nTesting Login...")
        login_data = {
            "email": "test@example.com",
            "password": "securepassword123"
        }
        resp = await client.post("/auth/login", json=login_data)
        if resp.status_code == 200:
            print("Login Success:", resp.json())
            token = resp.json()["token"]
        else:
            print("Login Failed:", resp.status_code, resp.text)
            return

        # Get Me
        print("\nTesting Get Me...")
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("/auth/me", headers=headers)
        if resp.status_code == 200:
            print("Get Me Success:", resp.json())
        else:
             print("Get Me Failed:", resp.status_code, resp.text)

        # Submit Score
        print("\nTesting Submit Score...")
        score_data = {
            "score": 1000,
            "mode": "walls",
            "duration": 60
        }
        resp = await client.post("/leaderboards/scores", json=score_data, headers=headers)
        if resp.status_code == 200:
            print("Submit Score Success:", resp.json())
        else:
            print("Submit Score Failed:", resp.status_code, resp.text)
            
        # Get Leaderboard
        print("\nTesting Leaderboard...")
        resp = await client.get("/leaderboards?limit=5")
        if resp.status_code == 200:
            print("Leaderboard Success:", resp.json())
        else:
            print("Leaderboard Failed:", resp.status_code, resp.text)

if __name__ == "__main__":
    asyncio.run(test_backend())
