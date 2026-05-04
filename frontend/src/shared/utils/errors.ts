import { AppError } from '@/shared/errors/app.error';

export function getLaravelFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AppError && error.status === 422 && error.details) {
    const details = error.details as Record<string, string[]>;
    return Object.fromEntries(
      Object.entries(details).map(([key, msgs]) => [key, msgs[0] ?? ''])
    );
  }
  return {};
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
