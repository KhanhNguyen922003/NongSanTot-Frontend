import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type { CreateShopBody, Shop } from './types';

export const useCreateShopMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateShopBody) => {
      const { data } = await apiClient.post<Shop>('/shops', body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myShops });
      void queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
    },
  });
};
