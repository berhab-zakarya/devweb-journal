import { useQuery } from '@tanstack/react-query';
import { dashboardSummaryQueryOptions } from '../queries/dashboard.queries';

export function useDashboard() {
  return useQuery(dashboardSummaryQueryOptions());
}
