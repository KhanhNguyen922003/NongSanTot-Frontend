import { useMutation, useQuery } from "@tanstack/react-query";
import { auth } from "../../../firebase.config";
import { queryKeys } from "@/constants/queryKeys";
import { apiClient } from "@/core/api/apiClient";
import { queryClient } from "@/queries";
import type { Product, UpdateSellerProductBody } from "./types";

const unwrapAxiosData = <T,>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const d = (payload as { data?: T }).data;
    if (d !== undefined) return d;
  }
  return payload as T;
};

export const useSellerProductsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.products.sellerList,
    queryFn: async () => {
      const response = await apiClient.get("/products/me/list");
      return unwrapAxiosData<Product[]>(response.data);
    },
    enabled: enabled && !!auth.currentUser,
  });

export const useUpdateSellerProductMutation = () =>
  useMutation({
    mutationFn: async (vars: { productId: string; body: UpdateSellerProductBody }) => {
      const response = await apiClient.patch(`/products/me/${vars.productId}`, vars.body);
      return unwrapAxiosData<Product>(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.sellerList });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopDashboard });
    },
  });

export const useArchiveSellerProductMutation = () =>
  useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiClient.delete(`/products/me/${productId}`);
      return unwrapAxiosData<Product>(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.sellerList });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shopDashboard });
    },
  });
