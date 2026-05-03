/**
 * Dashboard Domain Types
 *
 * All types for the dashboard feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Dashboard {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Dashboard-specific fields here
}

export interface DashboardDraft {
  // TODO: fields required to create a new Dashboard
}

export interface DashboardUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface DashboardFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Dashboard;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardsResponse {
  data: Dashboard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
