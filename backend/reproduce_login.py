import requests

try:
    response = requests.post("http://localhost:8000/api/auth/login", json={
        "email": "pixel@game.com",
        "password": "password123"
    })
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(e)
