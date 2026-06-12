import axios, { type AxiosRequestConfig } from 'axios';
import { clearAuth } from '@/lib/auth';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function customAxios<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await api(config);
  return data;
}
