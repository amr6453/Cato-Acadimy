import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("--- Starting API Test ---")
    
    # 1. Login
    login_url = f"{BASE_URL}/api/v1/users/login/"
    payload = {"email": "amdin@exampile.com", "password": "1234"}
    headers = {'Accept': 'application/json'}
    response = requests.post(login_url, json=payload, headers=headers)
    
    print(f"Login Response Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Login Response Text: {response.text[:500]}")
        return
    
    tokens = response.json()
    access_token = tokens['access']
    print("Login successful.")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 2. Create Category
    cat_url = f"{BASE_URL}/api/v1/courses/categories/"
    cat_payload = {"title": "Full Stack Development"}
    cat_res = requests.post(cat_url, json=cat_payload, headers=headers)
    
    if cat_res.status_code not in [200, 201]:
        print(f"Category creation failed: {cat_res.text}")
        return
    
    category_id = cat_res.json()['id']
    print(f"Category created: {cat_res.json()['title']} (ID: {category_id})")
    
    # 3. Create Course
    course_url = f"{BASE_URL}/api/v1/courses/instructor/courses/"
    course_payload = {
        "title": "Django Mastery",
        "description": "Deep dive into Django and DRF",
        "price": "149.99",
        "category": category_id,
        "status": "PUBLISHED"
    }
    course_res = requests.post(course_url, json=course_payload, headers=headers)
    
    if course_res.status_code not in [200, 201]:
        print(f"Course creation failed: {course_res.text}")
        return
    
    print(f"Course created: {course_res.json()['title']} (Slug: {course_res.json()['slug']})")
    
    # 4. List Public Courses
    public_url = f"{BASE_URL}/api/v1/courses/public/courses/"
    public_res = requests.get(public_url)
    
    if public_res.status_code == 200:
        print("Public Course List:")
        data = public_res.json()
        courses = data['results'] if isinstance(data, dict) and 'results' in data else data
        for course in courses:
            print(f"- {course['title']} (${course['price']})")
    else:
        print(f"Public list failed: {public_res.text}")

if __name__ == "__main__":
    test_api()
