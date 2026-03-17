from rest_framework import permissions

class IsInstructorRole(permissions.BasePermission):
    """
    Custom permission to only allow users with the INSTRUCTOR role to access.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'INSTRUCTOR'
        )

class IsCourseOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow instructors of a course to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `instructor`.

class IsCourseInstructor(permissions.BasePermission):
    """
    Custom permission to only allow instructors of a course to edit it or its components.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        from .models import Course, Section, Lesson
        if isinstance(obj, Course):
            return obj.instructor == request.user
        if isinstance(obj, Section):
            return obj.course.instructor == request.user
        if isinstance(obj, Lesson):
            return obj.section.course.instructor == request.user
        return False

class HasCourseAccess(permissions.BasePermission):
    """
    Custom permission to check if a student has an active enrollment for the course.
    Instructors can access their own courses without enrollment.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        from .models import Course, Section, Lesson, Enrollment
        
        # Determine the course object
        course = None
        if isinstance(obj, Course):
            course = obj
        elif isinstance(obj, Section):
            course = obj.course
        elif isinstance(obj, Lesson):
            course = obj.section.course
        
        if not course:
            return False

        # Allow if user is the instructor of the course
        if course.instructor == request.user:
            return True

        # Check for active enrollment
        return Enrollment.objects.filter(
            user=request.user,
            course=course,
            is_active=True
        ).exists()
