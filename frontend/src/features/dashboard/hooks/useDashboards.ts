/**
 * useDashboards hook
 *
 * Composes query options + useQuery for listing dashboards.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardListQueryOptions } from '../queries/dashboard.queries';
import type { DashboardFilters } from '../types/Dashboard.types';

export function useDashboards(filters?: DashboardFilters) {
  return useQuery(dashboardListQueryOptions(filters));
}
