from rest_framework import serializers
from ..models import Lesson, UserLessonProgress

class LessonSerializer(serializers.ModelSerializer):
    """
    Serializer for Lesson model, handling various content types and file validation.
    """
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'section', 'title', 'description', 
            'lesson_type', 'video_file', 'video_thumbnail', 'pdf_file', 
            'content_text', 'video_status', 'hls_playlist',
            'order', 'created_at', 'updated_at', 'is_completed'
        ]
        read_only_fields = ['id', 'section', 'order', 'created_at', 'updated_at', 'is_completed']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserLessonProgress.objects.filter(
            user=request.user,
            lesson=obj,
            is_completed=True
        ).exists()

    def to_internal_value(self, data):
        # Handle case-insensitive lesson_type
        if 'lesson_type' in data and isinstance(data['lesson_type'], str):
            # Avoid deepcopy of files in QueryDict.copy()
            if hasattr(data, 'dict'):
                data = data.dict()
            else:
                data = data.copy()
            data['lesson_type'] = data['lesson_type'].upper()
        return super().to_internal_value(data)

    def validate(self, attrs):
        lesson_type = attrs.get('lesson_type')
        
        # Cross-field validation for content types
        if lesson_type == Lesson.VIDEO and not attrs.get('video_file'):
            raise serializers.ValidationError({"video_file": "Video file is required for VIDEO lesson type."})
        
        if lesson_type == Lesson.PDF and not attrs.get('pdf_file'):
            raise serializers.ValidationError({"pdf_file": "PDF file is required for PDF lesson type."})
            
        if lesson_type == Lesson.TEXT and not attrs.get('content_text'):
            raise serializers.ValidationError({"content_text": "Content text is required for TEXT lesson type."})
            
        return attrs
