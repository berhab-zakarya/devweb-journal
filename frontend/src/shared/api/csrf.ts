import { apiClient } from './client';

/** In-flight CSRF fetch; cleared after completion so the next call can refresh the cookie. */
let inflight: Promise<void> | null = null;

/**
 * Fetches `GET /api/v1/sanctum/csrf-cookie` so Laravel sets `XSRF-TOKEN` for the current session.
 * Concurrent callers share one in-flight request. After it completes, the next call issues a new GET.
 */
export async function ensureCsrfCookie(): Promise<void> {
  if (inflight) {
    return inflight;
  }

  const pending = apiClient
    .get('/sanctum/csrf-cookie')
    .then(() => undefined)
    .finally(() => {
      if (inflight === pending) {
        inflight = null;
      }
    });

  inflight = pending;
  return pending;
}

/** Call after logout or when the session is invalidated so the next unsafe request fetches CSRF again. */
export function resetCsrfCookieCache(): void {
  inflight = null;
}
