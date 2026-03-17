from rest_framework import serializers
from ..models import Enrollment, UserLessonProgress, Course

class UserLessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLessonProgress
        fields = ['id', 'lesson', 'is_completed', 'watched_duration', 'last_accessed']
        read_only_fields = ['id', 'last_accessed']

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'course_title', 'student_email', 'enrolled_at', 'is_active', 'completion_percentage']
        read_only_fields = ['id', 'enrolled_at', 'completion_percentage', 'user']

class MyCourseSerializer(serializers.ModelSerializer):
    """
    Serializer for listing courses a student is enrolled in.
    """
    category_title = serializers.CharField(source='category.title', read_only=True)
    instructor_name = serializers.CharField(source='instructor.email', read_only=True)
    completion_percentage = serializers.SerializerMethodField()
    last_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'thumbnail', 'category_title', 'instructor_name', 'completion_percentage', 'last_lesson_id']

    def get_completion_percentage(self, obj):
        user = self.context['request'].user
        enrollment = Enrollment.objects.filter(user=user, course=obj).first()
        return enrollment.completion_percentage if enrollment else 0

    def get_last_lesson_id(self, obj):
        user = self.context['request'].user
        if not user or not user.is_authenticated:
            return None
        
        # Get the most recently accessed lesson
        last_progress = UserLessonProgress.objects.filter(
            user=user,
            lesson__section__course=obj
        ).order_by('-last_accessed').first()

        if last_progress:
            return last_progress.lesson.id
        
        # If no progress, return the first lesson of the first section
        from ..models import Lesson
        first_lesson = Lesson.objects.filter(section__course=obj).order_by('section__order', 'order').first()
        return first_lesson.id if first_lesson else None
