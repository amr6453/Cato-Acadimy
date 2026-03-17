import django_filters
from .models import Course

class CourseFilter(django_filters.FilterSet):
    """
    Advanced filter for courses.
    """
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    instructor = django_filters.CharFilter(field_name="instructor__email", lookup_expr='icontains')
    category = django_filters.CharFilter(field_name="category__slug")

    class Meta:
        model = Course
        fields = ['category', 'instructor', 'min_price', 'max_price']
