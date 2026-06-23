// api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export const TOKEN_KEY = 'mm_access_token';
export const REFRESH_KEY = 'mm_refresh_token';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
};

client.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await storage.getItem(REFRESH_KEY);
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const newToken = data.data.accessToken;

      await storage.setItem(TOKEN_KEY, newToken);
      await storage.setItem(REFRESH_KEY, data.data.refreshToken);
      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return client(original);
    } catch (err) {
      processQueue(err, null);
      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(REFRESH_KEY);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
