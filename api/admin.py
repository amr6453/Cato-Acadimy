from django.contrib import admin
from .models import User

# تسجيل موديل المستخدم عشان يظهر في لوحة التحكم
admin.site.register(User)
