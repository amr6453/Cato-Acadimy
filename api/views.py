from django.conf import settings
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            # إعدادات الكوكيز من الـ settings
            cookie_settings = {
                'httponly': settings.SIMPLE_JWT.get('AUTH_COOKIE_HTTP_ONLY', True),
                'secure': settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False),
                'samesite': settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax'),
                'domain': settings.SIMPLE_JWT.get('AUTH_COOKIE_DOMAIN', None),
                'path': settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
            }

            # وضع الـ Access Token في الكوكي
            response.set_cookie(
                key=settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access'),
                value=access_token,
                max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
                **cookie_settings
            )
            # وضع الـ Refresh Token في الكوكي
            response.set_cookie(
                key=settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh'),
                value=refresh_token,
                max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds(),
                **cookie_settings
            )

            # لحماية أفضل، بنمسح التوكن من الـ Body عشان الـ JavaScript ميعرفش يقرأه
            del response.data['access']
            del response.data['refresh']
        return response
