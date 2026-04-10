import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: DecodedUser | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

interface DecodedUser {
  id: number;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  iat: number;
  exp: number;
}

const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (accessToken: string, refreshToken: string) => {
        try {
          const decodedUser = jwtDecode<DecodedUser>(accessToken);
          set({ accessToken, refreshToken, user: decodedUser });
        } catch (error) {
          console.error('Failed to decode token:', error);
          set({ accessToken: null, refreshToken: null, user: null });
        }
      },
      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);

export default useAuthStore;
