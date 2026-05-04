import { queryOptions } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from './dashboard.keys';

export const dashboardSummaryQueryOptions = () =>
  queryOptions({
    queryKey: dashboardKeys.summary(),
    queryFn:  dashboardService.getSummary,
    staleTime: 60_000,
  });
