/**
 * User Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All users queries/mutations reference keys from here.
 */

import type { UserFilters } from '../types/User.types';

export const usersKeys = {
  /** Base key for all users queries */
  all: ['users'] as const,

  /** All list variants */
  lists: () => [...usersKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: UserFilters) =>
    [...usersKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...usersKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...usersKeys.details(), id] as const,
} as const;
