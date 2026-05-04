import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type { DashboardSummary } from '../types/Dashboard.types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummary>(ENDPOINTS.DASHBOARD_BASE);
    return data;
  },
} as const;
