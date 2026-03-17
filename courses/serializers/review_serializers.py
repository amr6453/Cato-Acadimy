from rest_framework import serializers
from ..models import Review

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for course reviews.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_email', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at', 'user_email']

    def validate(self, attrs):
        # Additional validation can be added here if needed
        return attrs
