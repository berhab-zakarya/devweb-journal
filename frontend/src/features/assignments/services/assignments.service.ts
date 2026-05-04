import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type { Assignment, AssignmentReview, SubmitReviewPayload } from '../types/Assignment.types';

const BASE = ENDPOINTS.ASSIGNMENTS_BASE;

export const assignmentsService = {
  getById: async (id: number): Promise<Assignment> => {
    const { data } = await apiClient.get<Assignment>(`${BASE}/${id}`);
    return data;
  },

  respond: async (id: number, response: 'accepted' | 'decline'): Promise<Assignment> => {
    const { data } = await apiClient.patch<Assignment>(`${BASE}/${id}/respond`, { response });
    return data;
  },

  getReview: async (id: number): Promise<AssignmentReview> => {
    const { data } = await apiClient.get<AssignmentReview>(`${BASE}/${id}/review`);
    return data;
  },

  submitReview: async (id: number, payload: SubmitReviewPayload): Promise<AssignmentReview> => {
    const { data } = await apiClient.post<AssignmentReview>(`${BASE}/${id}/review`, payload);
    return data;
  },
} as const;
