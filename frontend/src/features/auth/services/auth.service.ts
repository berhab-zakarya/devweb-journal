/**
 * Auth Service
 *
 * This is the ONLY place where API calls for the auth feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Auth,
  AuthDraft,
  AuthUpdatePayload,
  AuthFilters,
  AuthsResponse,
} from '../types/Auth.types';

const BASE = ENDPOINTS.AUTH_BASE;

export const authService = {
  /**
   * Fetch a paginated list of auths.
   */
  getAll: async (filters?: AuthFilters): Promise<AuthsResponse> => {
    const { data } = await apiClient.get<AuthsResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single auth by ID.
   */
  getById: async (id: string): Promise<Auth> => {
    const { data } = await apiClient.get<Auth>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new auth.
   */
  create: async (payload: AuthDraft): Promise<Auth> => {
    const { data } = await apiClient.post<Auth>(BASE, payload);
    return data;
  },

  /**
   * Update an existing auth.
   */
  update: async ({ id, ...payload }: AuthUpdatePayload): Promise<Auth> => {
    const { data } = await apiClient.patch<Auth>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a auth by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
