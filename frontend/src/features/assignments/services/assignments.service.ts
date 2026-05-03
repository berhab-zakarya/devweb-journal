/**
 * Assignment Service
 *
 * This is the ONLY place where API calls for the assignments feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Assignment,
  AssignmentDraft,
  AssignmentUpdatePayload,
  AssignmentFilters,
  AssignmentsResponse,
} from '../types/Assignment.types';

const BASE = ENDPOINTS.ASSIGNMENTS_BASE;

export const assignmentsService = {
  /**
   * Fetch a paginated list of assignments.
   */
  getAll: async (filters?: AssignmentFilters): Promise<AssignmentsResponse> => {
    const { data } = await apiClient.get<AssignmentsResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single assignment by ID.
   */
  getById: async (id: string): Promise<Assignment> => {
    const { data } = await apiClient.get<Assignment>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new assignment.
   */
  create: async (payload: AssignmentDraft): Promise<Assignment> => {
    const { data } = await apiClient.post<Assignment>(BASE, payload);
    return data;
  },

  /**
   * Update an existing assignment.
   */
  update: async ({ id, ...payload }: AssignmentUpdatePayload): Promise<Assignment> => {
    const { data } = await apiClient.patch<Assignment>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a assignment by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
