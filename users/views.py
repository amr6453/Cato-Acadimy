from django.shortcuts import render
from django.conf import settings
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import CustomUser, Profile
from .serializers import UserSerializer, ProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .utils import set_auth_cookies, clear_auth_cookies

# Create your views here.

class UserInfoView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ProfileUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile


class CookieTokenObtainPairView(TokenObtainPairView):
    throttle_scope = 'auth'
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            set_auth_cookies(
                response,
                access_token=response.data.get('access'),
                refresh_token=response.data.get('refresh')
            )
        return response


class CookieTokenRefreshView(TokenRefreshView):
    throttle_scope = 'auth'
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if refresh_token:
            request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            set_auth_cookies(
                response,
                access_token=response.data.get('access')
            )
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
        clear_auth_cookies(response)
        return response
