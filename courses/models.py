from django.db import models, transaction
from django.conf import settings
from django.utils.text import slugify
from .validators import validate_file_size
from .utils import lesson_file_upload_to

class Category(models.Model):
    """
    Model representing a course category.
    """
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Course(models.Model):
    """
    Model representing an educational course.
    """
    DRAFT = 'DRAFT'
    PUBLISHED = 'PUBLISHED'
    REVIEW = 'REVIEW'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (PUBLISHED, 'Published'),
        (REVIEW, 'Review'),
    ]

    BEGINNER = 'BEGINNER'
    INTERMEDIATE = 'INTERMEDIATE'
    ADVANCED = 'ADVANCED'

    LEVEL_CHOICES = [
        (BEGINNER, 'Beginner'),
        (INTERMEDIATE, 'Intermediate'),
        (ADVANCED, 'Advanced'),
    ]

    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=500, null=True, blank=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', null=True, blank=True)
    promo_video = models.FileField(upload_to='courses/promo_videos/', null=True, blank=True, validators=[validate_file_size])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default=BEGINNER)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses_taught'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='courses'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT
    )
    course_includes = models.TextField(blank=True, help_text="Newline-separated list of items included in the course")
    learning_outcomes = models.TextField(blank=True, help_text="Newline-separated list of what students will learn")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def average_rating(self):
        from django.db.models import Avg
        from django.db.models.functions import Coalesce
        return self.reviews.aggregate(
            avg=Coalesce(Avg('rating'), 0.0, output_field=models.FloatField())
        )['avg']

    @property
    def total_enrollments(self):
        return self.enrollments.count()

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)



class Section(models.Model):
    """
    A section grouping lessons within a course.
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @transaction.atomic
    def save(self, *args, **kwargs):
        if not self.id:
            # Set default order to latest + 1
            last_section = self.course.sections.all().order_by("-order").first()
            if last_section:
                self.order = last_section.order + 1
            else:
                self.order = 1
        super().save(*args, **kwargs)


class Lesson(models.Model):
    """
    An individual lesson within a section.
    """
    VIDEO = 'VIDEO'
    PDF = 'PDF'
    TEXT = 'TEXT'

    LESSON_TYPES = [
        (VIDEO, 'Video'),
        (PDF, 'PDF'),
        (TEXT, 'Text'),
    ]

    PENDING = 'PENDING'
    PROCESSING = 'PROCESSING'
    COMPLETED = 'COMPLETED'
    FAILED = 'FAILED'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (PROCESSING, 'Processing'),
        (COMPLETED, 'Completed'),
        (FAILED, 'Failed'),
    ]

    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    lesson_type = models.CharField(max_length=10, choices=LESSON_TYPES, default=TEXT)
    
    # Media fields
    video_file = models.FileField(
        upload_to=lesson_file_upload_to, 
        validators=[validate_file_size],
        null=True, blank=True
    )
    video_thumbnail = models.ImageField(
        upload_to='lessons/thumbnails/', 
        null=True, blank=True
    )
    pdf_file = models.FileField(
        upload_to=lesson_file_upload_to, 
        validators=[validate_file_size],
        null=True, blank=True
    )
    content_text = models.TextField(blank=True)
    
    # HLS Processing fields
    video_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default=PENDING
    )
    hls_playlist = models.CharField(max_length=500, null=True, blank=True)
    encryption_key = models.BinaryField(null=True, blank=True)
    
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.title}"

    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = not self.id
        video_changed = False
        
        if not is_new:
            old_instance = Lesson.objects.get(pk=self.pk)
            if old_instance.video_file != self.video_file:
                video_changed = True
        
        if not self.id:
            # Set default order to latest + 1
            last_lesson = self.section.lessons.all().order_by("-order").first()
            if last_lesson:
                self.order = last_lesson.order + 1
            else:
                self.order = 1
        
        super().save(*args, **kwargs)
        
        # Trigger HLS processing if it's a new video or video file changed
        if (is_new or video_changed) and self.video_file and self.lesson_type == 'VIDEO':
            from .tasks import process_video_hls
            lesson_id = self.id
            transaction.on_commit(lambda: process_video_hls.delay(lesson_id))


class Enrollment(models.Model):
    """
    Model linking a User (Student) to a Course.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.email} enrolled in {self.course.title}"

    def update_completion_percentage(self):
        total_lessons = Lesson.objects.filter(section__course=self.course).count()
        if total_lessons == 0:
            self.completion_percentage = 100.00
        else:
            completed_lessons = UserLessonProgress.objects.filter(
                enrollment=self,
                is_completed=True
            ).count()
            self.completion_percentage = (completed_lessons / total_lessons) * 100
        self.save()


class UserLessonProgress(models.Model):
    """
    Tracks a student's progress in an individual lesson.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_progress'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='progress'
    )
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='lesson_progress'
    )
    is_completed = models.BooleanField(default=False)
    watched_duration = models.PositiveIntegerField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.email} - {self.lesson.title} - {self.is_completed}"

class Review(models.Model):
    """
    Model representing a course review by a student.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField(
        choices=[(i, i) for i in range(1, 6)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.course.title} - {self.rating}"
