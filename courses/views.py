from rest_framework.views import APIView
from rest_framework import viewsets, generics, permissions, filters, serializers
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Category, Course, Section, Lesson, Enrollment, UserLessonProgress, Review
from .serializers import (
    CategorySerializer, CourseSerializer, 
    SectionSerializer, LessonSerializer,
    CourseDeepSerializer, EnrollmentSerializer,
    MyCourseSerializer, UserLessonProgressSerializer,
    ReviewSerializer
)
from .filters import CourseFilter
from .permissions import (
    IsInstructorRole, IsCourseOwnerOrReadOnly, 
    IsCourseInstructor, HasCourseAccess
)
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.db.models import Sum, Count, Avg, Min, Max
from django.db.models.functions import TruncDay
from django.utils import timezone
import datetime

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing course categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class InstructorCourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for instructors to manage their own courses.
    """
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorRole, IsCourseOwnerOrReadOnly]

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDeepSerializer
        return CourseSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[IsInstructorRole, IsCourseOwnerOrReadOnly])
    def revenue(self, request, pk=None):
        course = self.get_object()
        from payments.models import Payment
        from django.db.models import Sum
        
        payments = Payment.objects.filter(course=course, status=Payment.COMPLETED)
        total_revenue = payments.aggregate(total=Sum('amount'))['total'] or 0
        total_sales = payments.count()

        return Response({
            'course_id': course.id,
            'course_title': course.title,
            'total_revenue': total_revenue,
            'total_sales': total_sales
        })

    @action(detail=False, methods=['get'], permission_classes=[IsInstructorRole])
    def stats(self, request):
        """
        Aggregate stats for the instructor's dashboard.
        """
        from payments.models import Payment
        from django.db.models import Sum, Count
        from django.utils import timezone
        import datetime

        instructor_courses = Course.objects.filter(instructor=request.user)
        
        # 1. Basic Counts
        total_courses = instructor_courses.count()
        total_students = Enrollment.objects.filter(
            course__instructor=request.user, 
            is_active=True
        ).values('user').distinct().count()

        # 2. Revenue
        total_revenue = Payment.objects.filter(
            course__instructor=request.user, 
            status=Payment.COMPLETED
        ).aggregate(total=Sum('amount'))['total'] or 0

        # 3. Avg. Completion
        enrollments = Enrollment.objects.filter(
            course__instructor=request.user, 
            is_active=True
        )
        avg_completion = enrollments.aggregate(avg=Avg('completion_percentage'))['avg'] or 0

        # 4. Revenue Growth (Last 30 Days)
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        daily_revenue = Payment.objects.filter(
            course__instructor=request.user,
            status=Payment.COMPLETED,
            created_at__gte=thirty_days_ago
        ).annotate(day=TruncDay('created_at')).values('day').annotate(revenue=Sum('amount')).order_by('day')

        # Format for Recharts
        growth_data = []
        # Handle cases where revenue is None by using Coalesce or manual check
        date_map = {item['day'].date(): float(item['revenue'] or 0) for item in daily_revenue}
        
        for i in range(30):
            d = (thirty_days_ago + datetime.timedelta(days=i+1)).date()
            growth_data.append({
                'date': d.strftime('%b %d'),
                'revenue': date_map.get(d, 0)
            })

        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'total_revenue': total_revenue,
            'avg_completion': round(float(avg_completion), 1),
            'revenue_growth': growth_data
        })


class SectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sections within a course.
    """
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsCourseInstructor]

    def get_queryset(self):
        return Section.objects.filter(course_id=self.kwargs['course_pk'])

    @transaction.atomic
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk') or self.request.data.get('course')
        if not course_id:
            raise serializers.ValidationError({"course": "Course ID is required."})
        course = Course.objects.get(pk=course_id)
        serializer.save(course=course)


class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing lessons within a section.
    """
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsCourseInstructor]

    def get_queryset(self):
        section_pk = self.kwargs.get('section_pk')
        if section_pk:
            return Lesson.objects.filter(section_id=section_pk)
        return Lesson.objects.all()

    @transaction.atomic
    def perform_create(self, serializer):
        section_id = self.kwargs.get('section_pk') or self.request.data.get('section')
        if not section_id:
            raise serializers.ValidationError({"section": "Section ID is required."})
        section = Section.objects.get(pk=section_id)
        serializer.save(section=section)

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [permissions.IsAuthenticated(), HasCourseAccess()]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, HasCourseAccess])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=lesson.section.course,
            is_active=True
        ).first()

        if not enrollment:
            return Response(
                {"error": "You are not enrolled in this course."},
                status=status.HTTP_403_FORBIDDEN
            )

        progress, created = UserLessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            enrollment=enrollment
        )
        progress.is_completed = True
        progress.save()

        # Update enrollment progress
        enrollment.update_completion_percentage()

        serializer = UserLessonProgressSerializer(progress)
        return Response(serializer.data)


class EnrollCourseView(generics.CreateAPIView):
    """
    Endpoint for a student to enroll in a course.
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        course_id = self.request.data.get('course')
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"course": "Course not found."})

        if Enrollment.objects.filter(user=self.request.user, course=course).exists():
            raise serializers.ValidationError({"detail": "You are already enrolled in this course."})
        
        serializer.save(user=self.request.user, course=course)


class MyCoursesListView(generics.ListAPIView):
    """
    List all courses the current user is enrolled in.
    """
    serializer_class = MyCourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(
            enrollments__user=self.request.user,
            enrollments__is_active=True
        ).select_related('category', 'instructor').prefetch_related('enrollments')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class PublicCourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet to list and retrieve published courses with filtering.
    """
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = CourseFilter
    ordering_fields = ['price', 'created_at', 'annotated_rating']
    search_fields = ['title', 'description', 'instructor__email', 'category__title']
    lookup_field = 'slug'

    def get_queryset(self):
        return Course.objects.all().annotate(
            annotated_rating=Avg('reviews__rating')
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDeepSerializer
        return CourseSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing course reviews.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(course_id=self.kwargs['course_pk'])

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk')
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"course": "Course not found."})

        # Logic: A student can only review a course they are actually enrolled in.
        if not Enrollment.objects.filter(user=self.request.user, course=course, is_active=True).exists():
            raise serializers.ValidationError({"detail": "You can only review courses you are enrolled in."})
        if Review.objects.filter(user=self.request.user, course=course).exists():
            raise serializers.ValidationError({"detail": "You have already reviewed this course."})

        serializer.save(user=self.request.user, course=course)

class VideoKeyView(APIView):
    """
    Returns the AES-128 decryption key for an HLS stream.
    Access is restricted to students with an active enrollment.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_id):
        from .models import Lesson, Enrollment
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Check for active enrollment in the course containing this lesson
        has_access = Enrollment.objects.filter(
            user=request.user, 
            course=lesson.section.course, 
            is_active=True
        ).exists()

        if not has_access:
            return Response(
                {"detail": "Access denied. Active enrollment required."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        if not lesson.encryption_key:
            return Response(
                {"detail": "Encryption key not found for this video."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Return raw binary key
        from django.http import HttpResponse
        return HttpResponse(
            lesson.encryption_key, 
            content_type='application/octet-stream'
        )
