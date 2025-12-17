import urllib.request
import json

url = "http://localhost:8000/api/auth/login"
data = {"email": "pixel@game.com", "password": "password123"}
jsondata = json.dumps(data).encode('utf-8')

req = urllib.request.Request(url, data=jsondata, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print(f"Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
