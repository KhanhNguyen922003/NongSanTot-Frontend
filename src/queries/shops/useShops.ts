import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient } from '@/core/api/apiClient';
import type { ShopDetailResponse } from './types';

/**
 * Công khai: Lấy chi tiết cửa hàng theo shopId
 * Bao gồm: shop info + statistics + products
 */
export const useShopDetailQuery = (shopId: string) =>
  useQuery({
    queryKey: queryKeys.shops.detail(shopId),
    queryFn: async () => {
      const { data } = await apiClient.get<ShopDetailResponse>(`/shops/${shopId}`);
      return data;
    },
    enabled: !!shopId,
  });
