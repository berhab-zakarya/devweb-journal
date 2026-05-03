/**
 * Review Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All reviews queries/mutations reference keys from here.
 */

import type { ReviewFilters } from '../types/Review.types';

export const reviewsKeys = {
  /** Base key for all reviews queries */
  all: ['reviews'] as const,

  /** All list variants */
  lists: () => [...reviewsKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: ReviewFilters) =>
    [...reviewsKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...reviewsKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...reviewsKeys.details(), id] as const,
} as const;
