import { useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient } from '@/core/api/apiClient';
import { queryClient } from '@/queries';
import type { CreateProductBody, Product } from './types';

export const useCreateProductMutation = () =>
  useMutation({
    mutationFn: async (body: CreateProductBody) => {
      const { data } = await apiClient.post<Product>('/products', body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopDashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.sellerList });
    },
  });
