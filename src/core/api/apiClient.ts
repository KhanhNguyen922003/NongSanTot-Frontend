import axios from 'axios';
import { auth } from '../../../firebase.config';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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
