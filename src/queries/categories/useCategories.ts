import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { queryKeys } from '@/constants/queryKeys';
import type { Category } from './types';

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
};

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchCategories,
    staleTime: 30_000,
  });