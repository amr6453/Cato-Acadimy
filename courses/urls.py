from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    CategoryViewSet, InstructorCourseViewSet, 
    PublicCourseViewSet, SectionViewSet, LessonViewSet,
    EnrollCourseView, MyCoursesListView, ReviewViewSet,
    VideoKeyView
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'courses', InstructorCourseViewSet, basename='courses')
router.register(r'sections', SectionViewSet, basename='sections')
router.register(r'lessons', LessonViewSet, basename='lessons')
router.register(r'public/courses', PublicCourseViewSet, basename='public-courses')

# Nested Routes
# /api/courses/{course_pk}/sections/
course_router = routers.NestedSimpleRouter(router, r'courses', lookup='course')
course_router.register(r'sections', SectionViewSet, basename='course-sections')

# /api/sections/{section_pk}/lessons/
section_router = routers.NestedSimpleRouter(router, r'sections', lookup='section')
section_router.register(r'lessons', LessonViewSet, basename='section-lessons')

# /api/courses/{course_pk}/reviews/
review_router = routers.NestedSimpleRouter(router, r'courses', lookup='course')
review_router.register(r'reviews', ReviewViewSet, basename='course-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(course_router.urls)),
    path('', include(section_router.urls)),
    path('', include(review_router.urls)),
    path('enroll/', EnrollCourseView.as_view(), name='enroll'),
    path('my-courses/', MyCoursesListView.as_view(), name='my-courses'),
    path('video-key/<int:lesson_id>/', VideoKeyView.as_view(), name='video-key'),
]
