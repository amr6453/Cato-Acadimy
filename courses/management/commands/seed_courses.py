from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course, Category, Section, Lesson

User = get_user_model()

CATEGORIES = [
    {'title': 'Web Development', 'slug': 'web-development', 'icon': '🌐'},
    {'title': 'Data Science', 'slug': 'data-science', 'icon': '📊'},
    {'title': 'Mobile Development', 'slug': 'mobile-development', 'icon': '📱'},
    {'title': 'DevOps', 'slug': 'devops', 'icon': '⚙️'},
    {'title': 'UI/UX Design', 'slug': 'ui-ux-design', 'icon': '🎨'},
]

COURSES = [
    {
        'title': 'Complete Django REST Framework',
        'subtitle': 'Build production-ready APIs with Django & DRF',
        'description': 'Master Django REST Framework from scratch. Learn authentication, serializers, viewsets, permissions, and deployment.',
        'price': 49.99,
        'level': 'INTERMEDIATE',
        'category_slug': 'web-development',
        'status': 'PUBLISHED',
        'learning_outcomes': 'Build REST APIs\nJWT Authentication\nDeploy to Production\nDatabase Design',
        'course_includes': '12 hours of video\n5 projects\nCertificate of completion',
    },
    {
        'title': 'React 19 Masterclass',
        'subtitle': 'Modern React with Hooks, Context & Zustand',
        'description': 'Learn React 19 with real-world projects. Build modern UIs with hooks, state management, and performance optimization.',
        'price': 39.99,
        'level': 'BEGINNER',
        'category_slug': 'web-development',
        'status': 'PUBLISHED',
        'learning_outcomes': 'React Hooks\nZustand State Management\nReact Router\nAPI Integration',
        'course_includes': '8 hours of video\n3 projects\nSource code included',
    },
    {
        'title': 'Python for Data Science',
        'subtitle': 'NumPy, Pandas, Matplotlib & Machine Learning',
        'description': 'Complete data science bootcamp with Python. From data cleaning to building machine learning models.',
        'price': 59.99,
        'level': 'BEGINNER',
        'category_slug': 'data-science',
        'status': 'PUBLISHED',
        'learning_outcomes': 'Data Analysis with Pandas\nData Visualization\nMachine Learning Basics\nJupyter Notebooks',
        'course_includes': '15 hours of video\n10 datasets\nReal-world projects',
    },
    {
        'title': 'Flutter Mobile Development',
        'subtitle': 'Build iOS & Android apps with one codebase',
        'description': 'Learn Flutter and Dart to build beautiful cross-platform mobile apps from scratch.',
        'price': 44.99,
        'level': 'INTERMEDIATE',
        'category_slug': 'mobile-development',
        'status': 'PUBLISHED',
        'learning_outcomes': 'Flutter Widgets\nState Management\nFirebase Integration\nApp Store Deployment',
        'course_includes': '10 hours of video\n2 complete apps\nDesign resources',
    },
    {
        'title': 'Docker & Kubernetes DevOps',
        'subtitle': 'Container orchestration for modern applications',
        'description': 'Master Docker and Kubernetes for deploying scalable, production-ready applications.',
        'price': 54.99,
        'level': 'ADVANCED',
        'category_slug': 'devops',
        'status': 'PUBLISHED',
        'learning_outcomes': 'Docker Containers\nKubernetes Orchestration\nCI/CD Pipelines\nCloud Deployment',
        'course_includes': '12 hours of video\nLab environment\nReal deployment scenarios',
    },
    {
        'title': 'UI/UX Design Fundamentals',
        'subtitle': 'Design beautiful interfaces with Figma',
        'description': 'Learn the principles of UI/UX design and build a professional portfolio using Figma.',
        'price': 34.99,
        'level': 'BEGINNER',
        'category_slug': 'ui-ux-design',
        'status': 'PUBLISHED',
        'learning_outcomes': 'Design Principles\nFigma Proficiency\nPrototyping\nUser Research',
        'course_includes': '6 hours of video\nFigma templates\nPortfolio projects',
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with demo categories, an instructor, and courses'

    def handle(self, *args, **options):
        # 1. Create or get instructor
        instructor, created = User.objects.get_or_create(
            email='instructor@catoacademy.com',
            defaults={
                'username': 'instructor',
                'role': 'INSTRUCTOR',
            }
        )
        if created:
            instructor.set_password('Password@123')
            instructor.save()
            self.stdout.write(self.style.SUCCESS('Created instructor: instructor@catoacademy.com'))

        # 2. Create categories
        category_map = {}
        for cat_data in CATEGORIES:
            cat, _ = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'title': cat_data['title'], 'icon': cat_data['icon']}
            )
            category_map[cat_data['slug']] = cat

        self.stdout.write(self.style.SUCCESS(f'Seeded {len(CATEGORIES)} categories'))

        # 3. Create courses
        created_count = 0
        for course_data in COURSES:
            cat = category_map.get(course_data.pop('category_slug'))
            if not Course.objects.filter(title=course_data['title']).exists():
                course = Course.objects.create(
                    instructor=instructor,
                    category=cat,
                    **course_data
                )
                # Add a demo section and lesson
                section = Section.objects.create(course=course, title='Introduction', order=1)
                Lesson.objects.create(
                    section=section,
                    title='Welcome to the course',
                    description='Overview of what you will learn.',
                    lesson_type='TEXT',
                    content_text='Welcome! This is the first lesson of the course. Get ready to learn amazing things!',
                    order=1
                )
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {created_count} new courses'))
        self.stdout.write(self.style.SUCCESS('✅ Database seeding complete!'))
