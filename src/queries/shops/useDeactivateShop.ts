import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type { Shop } from './types';

/**
 * Đóng cửa hàng (soft delete): `isActive = false`, giữ dữ liệu.
 */
export const useDeactivateMyShopMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<Shop>('/shops/me');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myShops });
      void queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
    },
  });
};
