import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type { Shop, UpdateShopBody } from './types';

/**
 * Sửa shop của user hiện tại (một shop / user).
 */
export const useUpdateMyShopMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateShopBody) => {
      const { data } = await apiClient.patch<Shop>('/shops/me', body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myShops });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
    },
  });
};
