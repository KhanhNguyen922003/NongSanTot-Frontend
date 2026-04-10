import { useState, useCallback } from 'react';
import { apiClient } from '../core/api/apiClient';
import { ApiResponse } from '../shared/types';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const get = useCallback(async (url: string, params?: any): Promise<ApiResponse<T>> => {
    setLoading(true);
    try {
      const res = await apiClient.get<any, ApiResponse<T>>(url, { params });
      setData(res.data);
      return res;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async (url: string, body: any): Promise<ApiResponse<T>> => {
    setLoading(true);
    try {
      const res = await apiClient.post<any, ApiResponse<T>>(url, body);
      setData(res.data);
      return res;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const put = useCallback(async (url: string, body: any): Promise<ApiResponse<T>> => {
    setLoading(true);
    try {
      const res = await apiClient.put<any, ApiResponse<T>>(url, body);
      setData(res.data);
      return res;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const del = useCallback(async (url: string): Promise<ApiResponse<T>> => {
    setLoading(true);
    try {
      const res = await apiClient.delete<any, ApiResponse<T>>(url);
      setData(res.data);
      return res;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, get, post, put, del };
}
