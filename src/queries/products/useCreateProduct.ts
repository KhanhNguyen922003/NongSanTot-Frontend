import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type { CreateProductBody, Product } from './types';

export const useCreateProductMutation = () =>
  useMutation({
    mutationFn: async (body: CreateProductBody) => {
      const { data } = await apiClient.post<Product>('/products', body);
      return data;
    },
  });
