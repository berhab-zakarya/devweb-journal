import { apiClient } from './client';

let csrfPromise: Promise<void> | null = null;

export async function ensureCsrfCookie(): Promise<void> {
  if (!csrfPromise) {
    csrfPromise = apiClient
      .get('/sanctum/csrf-cookie')
      .then(() => undefined)
      .catch((error) => {
        csrfPromise = null;
        throw error;
      });
  }

  return csrfPromise;
}

export function resetCsrfCookieCache(): void {
  csrfPromise = null;
}