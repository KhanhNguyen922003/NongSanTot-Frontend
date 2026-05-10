import { useQuery } from '@tanstack/react-query';
import { auth } from '../../../firebase.config';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type { ShopDashboardOverview } from './types';

export const fetchShopDashboard = async (): Promise<ShopDashboardOverview | null> => {
  const response = await apiClient.get('/shops/me/dashboard');
  return response.data.data ?? response.data;
};

export const useShopDashboardQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.shopDashboard,
    queryFn: fetchShopDashboard,
    enabled: enabled && !!auth.currentUser,
    staleTime: 20_000,
  });
