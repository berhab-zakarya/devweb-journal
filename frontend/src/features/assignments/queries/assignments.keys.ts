/**
 * Assignment Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All assignments queries/mutations reference keys from here.
 */

import type { AssignmentFilters } from '../types/Assignment.types';

export const assignmentsKeys = {
  /** Base key for all assignments queries */
  all: ['assignments'] as const,

  /** All list variants */
  lists: () => [...assignmentsKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: AssignmentFilters) =>
    [...assignmentsKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...assignmentsKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...assignmentsKeys.details(), id] as const,
} as const;
