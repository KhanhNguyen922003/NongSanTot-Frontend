import { AuthMeResponse } from '@/queries/Auth/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppUser = AuthMeResponse['user'];

interface AuthState {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);

export default useAuthStore;
