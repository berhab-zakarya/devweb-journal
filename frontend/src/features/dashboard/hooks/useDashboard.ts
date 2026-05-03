/**
 * useDashboard hook
 *
 * Fetches a single dashboard by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardDetailQueryOptions } from '../queries/dashboard.queries';

export function useDashboard(id: string) {
  return useQuery(dashboardDetailQueryOptions(id));
}
