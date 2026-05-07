import { useQuery } from '@tanstack/react-query';
import { auth } from '../../../firebase.config';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type { Shop } from './types';

export const fetchMyShops = async (): Promise<Shop> => {
  const { data } = await apiClient.get<Shop>('/shops/me');
  return data;
};

export const useMyShopsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.myShops,
    queryFn: fetchMyShops,
    enabled: enabled && !!auth.currentUser,
    staleTime: 30_000,
  });
