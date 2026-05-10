import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient } from '@/core/api/apiClient';
import type { MarketplaceProduct, ProductsFilterParams } from './types';

const buildProductsFilterKey = (filters: ProductsFilterParams) => {
  const normalized = {
    q: filters.q?.trim() || undefined,
    categorySlug: filters.categorySlug?.filter(Boolean).sort() || [],
    categoryId: filters.categoryId?.filter(Boolean).sort() || [],
    tags: filters.tags?.filter(Boolean).sort() || [],
    minRating: filters.minRating ?? undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
  };
  return JSON.stringify(normalized);
};

export const useProductsQuery = (
  filters: ProductsFilterParams = {},
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.products.all(buildProductsFilterKey(filters)),
    queryFn: async () => {
      const { data } = await apiClient.get<MarketplaceProduct[]>('/products', {
        params: {
          q: filters.q?.trim() || undefined,
          categorySlug: filters.categorySlug?.length
            ? filters.categorySlug.join(',')
            : undefined,
          categoryId: filters.categoryId?.length ? filters.categoryId.join(',') : undefined,
          tags: filters.tags?.length ? filters.tags.join(',') : undefined,
          minRating: filters.minRating,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        },
      });
      return data;
    },
    enabled,
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
