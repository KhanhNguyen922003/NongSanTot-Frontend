import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient } from '@/core/api/apiClient';
import type { MarketplaceProduct } from './types';

export const useProductsQuery = () =>
  useQuery({
    queryKey: queryKeys.products.all,
    queryFn: async () => {
      const { data } = await apiClient.get<MarketplaceProduct[]>('/products');
      return data;
    },
  });

export const useProductDetailQuery = (productId: string) =>
  useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: async () => {
      const { data } = await apiClient.get<MarketplaceProduct>(`/products/${productId}`);
      return data;
    },
    enabled: !!productId,
  });
