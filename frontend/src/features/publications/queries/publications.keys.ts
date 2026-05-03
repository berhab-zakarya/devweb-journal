/**
 * Publication Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All publications queries/mutations reference keys from here.
 */

import type { PublicationFilters } from '../types/Publication.types';

export const publicationsKeys = {
  /** Base key for all publications queries */
  all: ['publications'] as const,

  /** All list variants */
  lists: () => [...publicationsKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: PublicationFilters) =>
    [...publicationsKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...publicationsKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...publicationsKeys.details(), id] as const,
} as const;
