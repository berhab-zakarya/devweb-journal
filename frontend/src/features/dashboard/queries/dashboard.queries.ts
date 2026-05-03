/**
 * Dashboard Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard.keys';
import type { DashboardFilters } from '../types/Dashboard.types';

/**
 * Query options for fetching a paginated list of dashboards.
 */
export const dashboardListQueryOptions = (filters?: DashboardFilters) =>
  queryOptions({
    queryKey: dashboardKeys.list(filters),
    queryFn: () => dashboardService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single dashboard by ID.
 */
export const dashboardDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dashboardKeys.detail(id),
    queryFn: () => dashboardService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
