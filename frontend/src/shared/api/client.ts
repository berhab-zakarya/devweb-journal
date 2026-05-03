/**
 * Shared Axios Client
 *
 * Single Axios instance for the entire application.
 * ALL features must use this — never instantiate Axios directly.
 *
 * Interceptors:
 *  - Request: attaches Authorization header (if token present in storage)
 *  - Response: normalizes errors through AppError
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { AppError } from '../errors/app.error';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // [zakarya:inject:request-interceptor]
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: unknown }>) => {
    const status = error.response?.status ?? 0;
    const serverMessage = error.response?.data?.message ?? error.message;

    // [zakarya:inject:response-interceptor]

    if (status === 401) {
      // Token expired — clear storage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(
      new AppError(serverMessage, status, error.response?.data?.errors)
    );
  }
);
