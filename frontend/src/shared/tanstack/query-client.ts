/**
 * TanStack Query — Shared QueryClient
 *
 * Single QueryClient instance used by QueryClientProvider.
 * All global defaults are configured here.
 */

import { QueryClient } from '@tanstack/react-query';
import { AppError } from '../errors/app.error';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        gcTime: 300000,
        retry: (failureCount, error) => {
          if (error instanceof AppError && (error.isUnauthorized || error.isForbidden || error.isNotFound)) {
            return false; // Don't retry auth/permission/404 errors
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        throwOnError: false,
      },
      mutations: {
        retry: false,
        throwOnError: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns the shared QueryClient.
 * On the server a new instance is created per-request.
 * On the client a singleton is maintained.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
