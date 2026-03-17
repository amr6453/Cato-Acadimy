from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ADMIN = 'ADMIN'
    INSTRUCTOR = 'INSTRUCTOR'
    TA = 'TA'
    STUDENT = 'STUDENT'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (INSTRUCTOR, 'Instructor'),
        (TA, 'TA'),
        (STUDENT, 'Student'),
    ]

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STUDENT)

    def __str__(self):
        return self.email


class Profile(models.Model):
    """
    User Profile model to store additional information about the user.
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    social_links = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Profile of {self.user.email}"
    