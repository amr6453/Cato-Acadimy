from django.conf import settings

def set_auth_cookies(response, access_token=None, refresh_token=None):
    """
    Sets HttpOnly JWT cookies on a DRF Response object.
    """
    if access_token:
        response.set_cookie(
            key=settings.AUTH_COOKIE_ACCESS,
            value=access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            secure=settings.AUTH_COOKIE_SECURE,
            httponly=settings.AUTH_COOKIE_HTTP_ONLY,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path=settings.AUTH_COOKIE_PATH,
        )
    if refresh_token:
        response.set_cookie(
            key=settings.AUTH_COOKIE_REFRESH,
            value=refresh_token,
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            secure=settings.AUTH_COOKIE_SECURE,
            httponly=settings.AUTH_COOKIE_HTTP_ONLY,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path=settings.AUTH_COOKIE_PATH,
        )
    return response

def clear_auth_cookies(response):
    """
    Deletes JWT cookies from a DRF Response object.
    """
    response.delete_cookie(settings.AUTH_COOKIE_ACCESS)
    response.delete_cookie(settings.AUTH_COOKIE_REFRESH)
    return response
