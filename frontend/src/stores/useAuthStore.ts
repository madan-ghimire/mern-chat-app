import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import useSocketStore from './useSocketStore';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (user, token) => {
        try {
          set({ isLoading: true });
          // Store the token in localStorage
          localStorage.setItem('token', token);
          // Update the state
          set({ user, token, isAuthenticated: true, isLoading: false });
          // Initialize socket connection after login
          useSocketStore.getState().connect(user._id, token);
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        try {
          // Disconnect socket before logout
          useSocketStore.getState().disconnect();
          // Remove token from localStorage
          localStorage.removeItem('token');
          // Reset state
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: false, // Reset loading state on page refresh
      }),
    }
  )
);

export default useAuthStore;
