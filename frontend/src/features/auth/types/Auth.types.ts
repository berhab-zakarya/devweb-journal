/**
 * Auth Domain Types
 *
 * All types for the auth feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Auth {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Auth-specific fields here
}

export interface AuthDraft {
  // TODO: fields required to create a new Auth
}

export interface AuthUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface AuthFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Auth;
  sortOrder?: 'asc' | 'desc';
}

export interface AuthsResponse {
  data: Auth[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
