import axios from 'axios';
import { auth } from '../../../firebase.config';

export const normalizeApiBaseUrl = (raw?: string) => {
  const fallback = 'http://192.168.2.7:8080';
  const base = (raw || fallback).trim().replace(/\/+$/, '');
  return base.endsWith('/api') ? base.slice(0, -4) : base;
};

export const getApiBaseUrl = () => normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser && config.headers) {
    const idToken = await firebaseUser.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
