import { useMutation, useQuery } from '@tanstack/react-query';
import { auth } from '../../../firebase.config';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient } from '@/core/api/apiClient';
import { queryClient } from '@/queries';
import type { AddCartItemBody, Cart, UpdateCartItemBody } from './types';

export const fetchMyCart = async (): Promise<Cart> => {
  const { data } = await apiClient.get<Cart>('/carts/me');
  return data;
};

export const useMyCartQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.cart.me,
    queryFn: fetchMyCart,
    enabled: enabled && !!auth.currentUser,
  });

export const useAddCartItemMutation = () =>
  useMutation({
    mutationFn: async (body: AddCartItemBody) => {
      const { data } = await apiClient.post('/carts/me/items', body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.me });
    },
  });

export const useUpdateCartItemMutation = () =>
  useMutation({
    mutationFn: async ({ itemId, body }: { itemId: string; body: UpdateCartItemBody }) => {
      const { data } = await apiClient.patch(`/carts/me/items/${itemId}`, body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.me });
    },
  });

export const useRemoveCartItemMutation = () =>
  useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.delete(`/carts/me/items/${itemId}`);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.me });
    },
  });
