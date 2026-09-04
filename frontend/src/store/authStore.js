import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  authLoading: false,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Setters ───────────────────────────────────────────
      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          authLoading: false,
        }),

      // ── Restore Active Session from Backend ───────────────
      restoreSession: async () => {
        set({ authLoading: true });
        try {
          const response = await api.get('/auth/me');
          const data = response.data;
          const user = data.data?.user || (data.data?.id || data.data?._id ? data.data : data.user);

          if (user) {
            set({
              user,
              isAuthenticated: true,
              authLoading: false,
            });
            return user;
          }
        } catch {
          // No active session — leave state clean
        } finally {
          set({ authLoading: false });
        }
        return null;
      },

      // ── Normal Email/Password Login ───────────────────────
      login: async ({ email, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const user = data.data?.user || data.user;
          const accessToken = data.data?.accessToken || data.accessToken;
          const refreshToken = data.data?.refreshToken || data.refreshToken;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || 'Invalid email or password.',
          };
        }
      },

      // ── Normal Registration ───────────────────────────────
      register: async ({ name, email, password, username, firstName, lastName, phone, mobile }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', {
            name,
            email,
            password,
            username,
            firstName,
            lastName,
            phone: phone || mobile,
            mobile: mobile || phone,
          });
          const user = data.data?.user || data.user;
          const accessToken = data.data?.accessToken || data.accessToken;
          const refreshToken = data.data?.refreshToken || data.refreshToken;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || 'Registration failed. Please try again.',
          };
        }
      },

      // ── Firebase Auth (Google OAuth & Mobile SMS) ─────────
      loginWithFirebase: async (firebaseData) => {
        set({ isLoading: true });
        try {
          const payload =
            typeof firebaseData === 'string'
              ? { firebaseIdToken: firebaseData }
              : {
                  firebaseIdToken: firebaseData.idToken || firebaseData.firebaseIdToken,
                  ...firebaseData,
                };

          const { data } = await api.post('/auth/firebase-login', payload);
          const user = data.data?.user || data.user;
          const accessToken = data.data?.accessToken || data.accessToken;
          const refreshToken = data.data?.refreshToken || data.refreshToken;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            message: err.response?.data?.message || err.message || 'Authentication failed. Please try again.',
          };
        }
      },

      // Mobile Login Alias
      loginWithMobile: async (firebaseData) => {
        return get().loginWithFirebase(firebaseData);
      },

      // ── User Profile Sync ─────────────────────────────────
      fetchProfile: async () => {
        try {
          const { data } = await api.get('/users/me');
          const user = data.data?.user || (data.data?.id || data.data?._id ? data.data : data.user);
          if (user) {
            set({ user: { ...get().user, ...user } });
            return user;
          }
        } catch {
          // Handled by axios interceptors
        }
        return null;
      },

      updateUser: (updatedUser) => {
        set({ user: { ...get().user, ...updatedUser } });
      },

      // ── Logout ────────────────────────────────────────────
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Cookies or session already expired
        } finally {
          get().clearAuth();
          localStorage.removeItem('ai-interview-auth');
        }
      },
    }),
    {
      name: 'ai-interview-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
