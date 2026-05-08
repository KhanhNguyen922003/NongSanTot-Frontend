import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type {
  AdminDashboard,
  AdminProductDetail,
  AdminProductListItem,
} from './types';

export const useAdminDashboardQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminDashboard>('/admin/dashboard');
      return data;
    },
  });

export const useAdminProductsQuery = (status = 'pending_review') =>
  useQuery({
    queryKey: queryKeys.admin.products(status),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProductListItem[]>('/admin/products', {
        params: { status },
      });
      return data;
    },
  });

export const useAdminProductDetailQuery = (productId: string) =>
  useQuery({
    queryKey: queryKeys.admin.product(productId),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProductDetail>(`/admin/products/${productId}`);
      return data;
    },
    enabled: !!productId,
  });

export const useApproveAdminProductMutation = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note?: string) => {
      const { data } = await apiClient.patch<AdminProductDetail>(
        `/admin/products/${productId}/approve`,
        { note },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products('pending_review') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.product(productId) });
    },
  });
};

export const useRejectAdminProductMutation = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason: string) => {
      const { data } = await apiClient.patch<AdminProductDetail>(
        `/admin/products/${productId}/reject`,
        { reason },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products('pending_review') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.product(productId) });
    },
  });
};
