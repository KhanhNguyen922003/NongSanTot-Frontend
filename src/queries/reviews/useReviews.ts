import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient } from '@/core/api/apiClient';
import { queryClient } from '@/queries';
import type {
  CreateDemoReviewBody,
  CreateMyReviewBody,
  MyReviewEligibility,
  ProductReviewsResponse,
} from './types';

export const useProductReviewsQuery = (productId: string) =>
  useQuery({
    queryKey: queryKeys.reviews.byProduct(productId),
    queryFn: async () => {
      const { data } = await apiClient.get<ProductReviewsResponse>(`/reviews/products/${productId}`);
      return data;
    },
    enabled: !!productId,
  });

export const useMyReviewEligibilityQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.reviews.eligibility(productId),
    queryFn: async () => {
      const { data } = await apiClient.get<MyReviewEligibility>('/reviews/me/eligibility', {
        params: { productId },
      });
      return data;
    },
    enabled: !!productId && enabled,
  });

export const useCreateMyReviewMutation = () =>
  useMutation({
    mutationFn: async (body: CreateMyReviewBody) => {
      const { data } = await apiClient.post('/reviews/me', body);
      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byProduct(variables.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.eligibility(variables.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.productId) });
    },
  });

export const useCreateDemoReviewMutation = () =>
  useMutation({
    mutationFn: async (body: CreateDemoReviewBody) => {
      const { data } = await apiClient.post('/admin/reviews/demo', body);
      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byProduct(variables.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products('active') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.products('pending_review') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });