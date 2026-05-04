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
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
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

    // Do not perform a global redirect here — let the UI layer decide how to
    // handle authentication state. Redirecting from the interceptor causes
    // navigation loops during auth hydration (/auth/me calls). Simply wrap
    // the server error in an AppError and reject so callers can handle 401.
    throw new AppError(serverMessage, status, error.response?.data?.errors);
  }
);
