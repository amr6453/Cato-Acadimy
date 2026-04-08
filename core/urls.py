from django.contrib import admin
from django.urls import path, include
from api.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls), # لو حبيت تدخل كمدير للموقع
    path('auth/', include('djoser.urls')), # روابط التسجيل والتحقق
    path('auth/', include('djoser.urls.jwt')), # روابط تسجيل الدخول (التوكن)
    path('auth/jwt/create/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), ]