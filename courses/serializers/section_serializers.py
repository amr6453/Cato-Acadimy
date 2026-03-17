from rest_framework import serializers
from ..models import Section
from .lesson_serializers import LessonSerializer

class SectionSerializer(serializers.ModelSerializer):
    """
    Serializer for Section model.
    """
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'course', 'title', 'order', 'lessons', 'created_at']
        read_only_fields = ['id', 'course', 'order', 'created_at']
