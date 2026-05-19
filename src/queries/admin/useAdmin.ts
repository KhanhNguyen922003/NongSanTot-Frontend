import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type {
  AdminDashboard,
  AdminUserListItem,
  AdminUserRoleFilter,
  AdminShopListItem,
  AdminShopStatusFilter,
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

export const useAdminUsersQuery = (role: AdminUserRoleFilter = 'all') =>
  useQuery({
    queryKey: ['admin', 'users', role] as const,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminUserListItem[]>('/admin/users', {
        params: { role },
      });
      return data;
    },
  });

export const useUpdateAdminUserRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'buyer' | 'seller' }) => {
      const { data } = await apiClient.patch<AdminUserListItem>(`/admin/users/${userId}/role`, {
        role,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
    },
  });
};

export const useAdminShopsQuery = (status: AdminShopStatusFilter = 'all') =>
  useQuery({
    queryKey: queryKeys.admin.shops(status),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminShopListItem[]>('/admin/shops', {
        params: { status },
      });
      return data;
    },
  });

export const useToggleAdminShopStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, isActive }: { shopId: string; isActive: boolean }) => {
      const { data } = await apiClient.patch<AdminShopListItem>(`/admin/shops/${shopId}/status`, {
        isActive,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.shops('all') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.shops('active') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.shops('inactive') });
    },
  });
};

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
