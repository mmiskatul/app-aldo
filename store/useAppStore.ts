import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  restaurant_name: string;
  [key: string]: any; // Allow other fields from the API
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  tokens: Tokens | null;
  setUser: (user: User | null, tokens?: Tokens | null) => void;
  setTokens: (tokens: Tokens | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      user: null,
      tokens: null,
      setUser: (user, tokens = null) => set({ user, tokens }),
      setTokens: (tokens: Tokens | null) => set({ tokens }),
      logout: () => set({ user: null, tokens: null }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
