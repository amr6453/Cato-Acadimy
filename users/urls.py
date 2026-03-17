from django.urls import path
from .views import (
    UserInfoView, 
    CookieTokenObtainPairView, 
    CookieTokenRefreshView, 
    LogoutView,
    ProfileUpdateView
)

urlpatterns = [
    path('user/', UserInfoView.as_view(), name='user-info'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]