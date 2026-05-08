import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/apiClient";
import { queryKeys } from "@/constants/queryKeys";
import { queryClient } from "@/queries";
import type { Address, AddressBody } from "./types";

export const fetchAddressesByUser = async (userId: string): Promise<Address[]> => {
  const { data } = await apiClient.get<Address[]>(`/addresses/user/${userId}`);
  return data;
};

export const useAddressesByUserQuery = (userId?: string | null) =>
  useQuery({
    queryKey: queryKeys.addresses.byUser(userId ?? ""),
    queryFn: () => fetchAddressesByUser(userId ?? ""),
    enabled: !!userId,
  });

export const useCreateAddressMutation = (userId?: string | null) =>
  useMutation({
    mutationFn: async (body: AddressBody) => {
      const { data } = await apiClient.post<Address>("/addresses", body);
      return data;
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.byUser(userId) });
      }
    },
  });

export const useUpdateAddressMutation = (userId?: string | null) =>
  useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<AddressBody> }) => {
      const { data } = await apiClient.patch<Address>(`/addresses/${id}`, body);
      return data;
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.byUser(userId) });
      }
    },
  });

export const useDeleteAddressMutation = (userId?: string | null) =>
  useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.byUser(userId) });
      }
    },
  });
