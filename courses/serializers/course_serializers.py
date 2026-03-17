from rest_framework import serializers
from ..models import Course
from .base import CategorySerializer
from .section_serializers import SectionSerializer

class CourseDeepSerializer(serializers.ModelSerializer):
    """
    Deeply nested read-only serializer for Course structure.
    """
    category = CategorySerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'slug', 'description', 'thumbnail', 
            'promo_video', 'price', 'level', 'instructor', 'instructor_name', 'category', 
            'status', 'sections', 'average_rating', 'total_enrollments',
            'learning_outcomes', 'course_includes',
            'created_at', 'updated_at'
        ]
        read_only_fields = fields
