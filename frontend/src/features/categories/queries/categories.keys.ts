/**
 * Category Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All categories queries/mutations reference keys from here.
 */

import type { CategoryFilters } from '../types/Category.types';

export const categoriesKeys = {
  /** Base key for all categories queries */
  all: ['categories'] as const,

  /** All list variants */
  lists: () => [...categoriesKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: CategoryFilters) =>
    [...categoriesKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...categoriesKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...categoriesKeys.details(), id] as const,
} as const;
