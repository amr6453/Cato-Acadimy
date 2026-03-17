from rest_framework import serializers
from ..models import Category, Course
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model.
    """
    class Meta:
        model = Category
        fields = ['id', 'title', 'slug', 'icon']
        read_only_fields = ['slug']

class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Course model.
    """
    category_details = CategorySerializer(source='category', read_only=True)
    instructor_details = UserSerializer(source='instructor', read_only=True)
    is_processing = serializers.SerializerMethodField()

    def get_is_processing(self, obj):
        return obj.sections.filter(lessons__video_status='PROCESSING').exists()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'slug', 'description', 'thumbnail', 
            'promo_video', 'price', 'level', 'instructor', 'category', 'status', 
            'category_details', 'instructor_details',
            'course_includes', 'learning_outcomes',
            'is_processing',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'instructor', 'created_at', 'updated_at']
