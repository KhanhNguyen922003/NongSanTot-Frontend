import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase.config';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import { queryClient } from '../index';
import { AuthMeResponse } from './types';

export const fetchAuthMe = async (): Promise<AuthMeResponse> => {
  const response = await apiClient.get('/auth/me');
  return response.data.data ?? response.data;
};

export const useAuthMeQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.authMe,
    queryFn: fetchAuthMe,
    enabled: enabled && !!auth.currentUser,
    staleTime: 60_000,
    retry: (count, err: any) => err?.response?.status !== 401 && count < 2,
  });

/**
 * Handle invalidate/remove auth-related cache based on Firebase session changes.
 */
export const handleAuthInvalidate = () =>
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myShops });
      return;
    }

    queryClient.removeQueries({ queryKey: queryKeys.authMe });
    queryClient.removeQueries({ queryKey: queryKeys.myShops });
  });
