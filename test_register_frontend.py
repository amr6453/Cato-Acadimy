import requests
import json

def test_registration_frontend_path():
    url = "http://127.0.0.1:8000/api/v1/users/register/"
    data = {
        "username": "test_frontend",
        "email": "test_frontend@example.com",
        "password": "pass1234",
        "confirmPassword": "pass1234"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(data), headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_registration_frontend_path()
