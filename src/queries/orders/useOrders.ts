import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient } from '@/core/api/apiClient';
import { queryClient } from '@/queries';
import type {
  BuyerConfirmNegotiationBody,
  CheckoutBody,
  CheckoutResult,
  CheckoutShippingQuote,
  ConfirmOrderBody,
  Order,
  OrderDetail,
} from './types';

export const useCheckoutShippingQuoteQuery = (
  shippingAddressId?: string,
  fastShipping = false,
) =>
  useQuery({
    queryKey: queryKeys.orders.shippingQuote(shippingAddressId ?? '', fastShipping),
    queryFn: async () => {
      const { data } = await apiClient.get<CheckoutShippingQuote>('/orders/checkout/quote', {
        params: {
          shippingAddressId,
          fastShipping,
        },
      });
      return data;
    },
    enabled: !!shippingAddressId,
  });

export const useCheckoutOrderMutation = () =>
  useMutation({
    mutationFn: async (body: CheckoutBody) => {
      const { data } = await apiClient.post<CheckoutResult>('/orders/checkout', body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.myBuy });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.mySell });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopDashboard });
    },
  });

export const useMyBuyOrdersQuery = () =>
  useQuery({
    queryKey: queryKeys.orders.myBuy,
    queryFn: async () => {
      const { data } = await apiClient.get<Order[]>('/orders/me/buy');
      return data;
    },
  });

export const useMySellOrdersQuery = () =>
  useQuery({
    queryKey: queryKeys.orders.mySell,
    queryFn: async () => {
      const { data } = await apiClient.get<Order[]>('/orders/me/sell');
      return data;
    },
  });

export const useOrderDetailQuery = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: async () => {
      const { data } = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });

export const useConfirmOrderMutation = (orderId: string) =>
  useMutation({
    mutationFn: async (body: ConfirmOrderBody) => {
      const { data } = await apiClient.patch<OrderDetail>(`/orders/${orderId}/confirm`, body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.mySell });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopDashboard });
    },
  });

export const useCancelOrderMutation = (orderId: string) =>
  useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch<OrderDetail>(`/orders/${orderId}/cancel`);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.myBuy });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.mySell });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopDashboard });
    },
  });

export const useBuyerConfirmNegotiationOrderMutation = (orderId: string) =>
  useMutation({
    mutationFn: async (body: BuyerConfirmNegotiationBody) => {
      const { data } = await apiClient.patch<OrderDetail>(
        `/orders/${orderId}/negotiation/confirm-address`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.myBuy });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
      void queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'conversations',
      });
    },
  });
