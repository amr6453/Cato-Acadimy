from rest_framework import serializers

class RevenueSerializer(serializers.Serializer):
    """
    Serializer for course revenue statistics.
    """
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_sales = serializers.IntegerField()
