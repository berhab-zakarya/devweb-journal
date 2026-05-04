/**
 * AppError
 *
 * Normalized application error.
 * All errors surfaced from the Axios client are instances of AppError.
 */

export class AppError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;

    // Fix prototype chain for transpiled TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details,
    };
  }
}
