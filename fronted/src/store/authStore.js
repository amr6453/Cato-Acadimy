import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true during initial session check

  // ─── Initialise from existing cookie session ─────────────────────────────
  initAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/api/v1/users/user/');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // ─── Called after successful login ───────────────────────────────────────
  setUser: (userData) =>
    set({ user: userData, isAuthenticated: true, isLoading: false }),

  // ─── Logout ──────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      await api.post('/api/v1/users/logout/');
    } catch {
      // Even if the server call fails, clear client state
    }
    set({ user: null, isAuthenticated: false });
  },

  // ─── Called by interceptor when refresh fails ─────────────────────────────
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
