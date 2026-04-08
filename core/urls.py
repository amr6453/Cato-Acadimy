from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from api.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls), # لو حبيت تدخل كمدير للموقع
    path('auth/', include('djoser.urls')), # روابط التسجيل والتحقق
    path('auth/', include('djoser.urls.jwt')), # روابط تسجيل الدخول (التوكن)
    path('auth/jwt/create/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # أي رابط مش API حيروح للـ Frontend
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]