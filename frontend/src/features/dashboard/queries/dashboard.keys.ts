/**
 * Dashboard Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All dashboard queries/mutations reference keys from here.
 */

import type { DashboardFilters } from '../types/Dashboard.types';

export const dashboardKeys = {
  /** Base key for all dashboard queries */
  all: ['dashboard'] as const,

  /** All list variants */
  lists: () => [...dashboardKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: DashboardFilters) =>
    [...dashboardKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...dashboardKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...dashboardKeys.details(), id] as const,
} as const;
