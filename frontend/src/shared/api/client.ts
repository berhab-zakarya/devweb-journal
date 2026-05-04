/**
 * Shared Axios Client
 *
 * Single Axios instance for the entire application.
 * ALL features must use this — never instantiate Axios directly.
 *
 * Interceptors:
 *  - Request: reserved for shared request shaping
 *  - Response: normalizes errors through AppError
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { AppError } from '../errors/app.error';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1',
  withCredentials: true,
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
      // Session expired — redirect to login
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/login';
      }
    }

    throw new AppError(serverMessage, status, error.response?.data?.errors);
  }
);
