import os
import django
import requests
import json
import traceback

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lern.settings')
django.setup()

from users.models import CustomUser
from courses.models import Course, Enrollment, Review
from rest_framework_simplejwt.tokens import AccessToken

base_url = "http://127.0.0.1:8000"

def test_api(name, method, url, headers=None, json_data=None):
    print(f"\n--- {name} ---")
    print(f"URL: {url}")
    if method == "GET":
        resp = requests.get(url, headers=headers)
    elif method == "POST":
        resp = requests.post(url, headers=headers, json=json_data)
    
    print(f"Status: {resp.status_code}")
    try:
        data = resp.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return data
    except:
        print(f"Response (not JSON): {resp.text[:500]}")
        return None

if __name__ == "__main__":
    try:
        student_email = "student@example.com"
        student = CustomUser.objects.get(email=student_email)
        student_token = str(AccessToken.for_user(student))
        
        instructor = CustomUser.objects.filter(role='INSTRUCTOR').first()
        instructor_token = str(AccessToken.for_user(instructor)) if instructor else None

        # 1. Test Search
        test_api("Search Courses", "GET", f"{base_url}/api/public/courses/?category=Programming&min_price=0")
        
        # 2. Test Review without Enrollment
        Enrollment.objects.filter(user=student, course_id=1).delete()
        test_api("Review without Enrollment", "POST", f"{base_url}/api/courses/1/reviews/", 
                 headers={"Authorization": f"Bearer {student_token}"}, 
                 json_data={"rating": 5, "comment": "Should fail"})
        
        # 3. Enroll Student
        Enrollment.objects.get_or_create(user=student, course_id=1)
        print("\nStudent Enrolled.")
        
        # 4. Test Review with Enrollment
        Review.objects.filter(user=student, course_id=1).delete()
        test_api("Review with Enrollment", "POST", f"{base_url}/api/courses/1/reviews/", 
                 headers={"Authorization": f"Bearer {student_token}"}, 
                 json_data={"rating": 4, "comment": "Amazing course!"})
        
        # 5. Test Course Stats
        test_api("Course Stats", "GET", f"{base_url}/api/public/courses/1/")
        
        # 6. Test Instructor Revenue
        if instructor_token:
            test_api("Instructor Revenue", "GET", f"{base_url}/api/courses/1/revenue/", 
                     headers={"Authorization": f"Bearer {instructor_token}"})
            
    except Exception as e:
        traceback.print_exc()
