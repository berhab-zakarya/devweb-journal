import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type { DashboardSummary, DashboardSummaryResponse } from '../types/Dashboard.types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummaryResponse>(ENDPOINTS.DASHBOARD_BASE);
    return data.data;
  },
} as const;
