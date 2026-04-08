import os
from celery import Celery

# بنقول لـ سيليري يستخدم إعدادات مشروعنا الجديد
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')

# استخدام بادئة CELERY_ في ملف settings.py
app.config_from_object('django.conf:settings', namespace='CELERY')

# البحث عن المهام (tasks.py) في كل التطبيقات تلقائياً
app.autodiscover_tasks()
