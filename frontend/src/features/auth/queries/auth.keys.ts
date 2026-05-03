/**
 * Auth Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All auth queries/mutations reference keys from here.
 */

import type { AuthFilters } from '../types/Auth.types';

export const authKeys = {
  /** Base key for all auth queries */
  all: ['auth'] as const,

  /** All list variants */
  lists: () => [...authKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: AuthFilters) =>
    [...authKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...authKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...authKeys.details(), id] as const,
} as const;
