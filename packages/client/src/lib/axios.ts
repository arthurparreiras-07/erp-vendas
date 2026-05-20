import axios from 'axios';
import { clearAuth, isTokenExpired } from '@/lib/auth';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (isTokenExpired()) {
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(new Error('Sessão expirada'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function customAxios<T>(config: Parameters<typeof api>[0]): Promise<T> {
  const { data } = await api(config as any);
  return data;
}
