import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(email, password);
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.signup(username, email, password);
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Signup failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          set({ user: null, token: null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'snake-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
