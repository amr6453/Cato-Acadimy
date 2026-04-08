import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// URLs that should NEVER trigger the 401→refresh retry cycle.
// These are calls that happen during session init or auth flows themselves.
const NO_RETRY_URLS = [
  '/api/v1/users/user/',
  '/api/v1/users/login/',
  '/api/v1/users/logout/',
  '/api/v1/users/refresh/',
  '/auth/users/',
  '/auth/jwt/create/',
];

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // HttpOnly cookies are sent automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Response Interceptor ────────────────────────────────────────────────────
// On 401:
//   - If the failing URL is in NO_RETRY_URLS → just reject, no refresh attempt.
//     (This prevents the infinite loop when initAuth fails because there's no session.)
//   - Otherwise → silently attempt a token refresh, then retry the original request.
//   - If refresh also fails → call clearAuth() so Zustand flips isAuthenticated=false,
//     which makes ProtectedRoute redirect to /login naturally (NO window.location.href).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    const isNoRetryUrl = NO_RETRY_URLS.some((u) => requestUrl.includes(u));

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRetryUrl
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${BASE_URL}/api/v1/users/refresh/`,
          {},
          { withCredentials: true }
        );
        // Access cookie refreshed — retry original request
        return api(originalRequest);
      } catch {
        // Refresh failed: flip Zustand state → ProtectedRoute handles the redirect
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
