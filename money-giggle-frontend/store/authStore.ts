// store/authStore.ts
import { create } from 'zustand';
import { storage } from '@/utils/storage';
import { TOKEN_KEY, REFRESH_KEY } from '@/api/client';
import type { UserProfile } from '@/api/types';

const USER_KEY = 'mm_user';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (token: string, refreshToken: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (token, refreshToken, user) => {
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(REFRESH_KEY, refreshToken);
    await storage.setItem(USER_KEY, JSON.stringify(user));
    set({ accessToken: token, user, isAuthenticated: true });
  },

  logout: async () => {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(REFRESH_KEY);
    await storage.deleteItem(USER_KEY);
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const token = await storage.getItem(TOKEN_KEY);
      const userRaw = await storage.getItem(USER_KEY);
      if (token && userRaw) {
        set({ accessToken: token, user: JSON.parse(userRaw), isAuthenticated: true });
      }
    } catch {
      // storage error — start fresh
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (user) => set({ user }),
}));
