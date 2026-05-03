/**
 * Dashboard Service
 *
 * This is the ONLY place where API calls for the dashboard feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Dashboard,
  DashboardDraft,
  DashboardUpdatePayload,
  DashboardFilters,
  DashboardsResponse,
} from '../types/Dashboard.types';

const BASE = ENDPOINTS.DASHBOARD_BASE;

export const dashboardService = {
  /**
   * Fetch a paginated list of dashboards.
   */
  getAll: async (filters?: DashboardFilters): Promise<DashboardsResponse> => {
    const { data } = await apiClient.get<DashboardsResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single dashboard by ID.
   */
  getById: async (id: string): Promise<Dashboard> => {
    const { data } = await apiClient.get<Dashboard>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new dashboard.
   */
  create: async (payload: DashboardDraft): Promise<Dashboard> => {
    const { data } = await apiClient.post<Dashboard>(BASE, payload);
    return data;
  },

  /**
   * Update an existing dashboard.
   */
  update: async ({ id, ...payload }: DashboardUpdatePayload): Promise<Dashboard> => {
    const { data } = await apiClient.patch<Dashboard>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a dashboard by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
