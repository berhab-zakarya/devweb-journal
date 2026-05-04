/**
 * Review Service
 *
 * This is the ONLY place where API calls for the reviews feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Review,
  ReviewDraft,
  ReviewUpdatePayload,
  ReviewFilters,
  ReviewsResponse,
} from '../types/Review.types';

const ASSIGNMENTS = ENDPOINTS.ASSIGNMENTS_BASE;
const ARTICLES = ENDPOINTS.ARTICLES_BASE;

export const reviewsService = {
  /**
   * Fetch reviews for a given article.
   */
  getAll: async (filters?: ReviewFilters): Promise<ReviewsResponse> => {
    if (!filters?.article_id) {
      return [];
    }
    const { data } = await apiClient.get<ReviewsResponse>(`${ARTICLES}/${filters.article_id}/reviews`);
    return data;
  },

  /**
   * Fetch a review by assignment ID.
   */
  getById: async (assignmentId: number): Promise<Review> => {
    const { data } = await apiClient.get<Review>(`${ASSIGNMENTS}/${assignmentId}/review`);
    return data;
  },

  /**
   * Submit (or save draft) review for an assignment.
   */
  create: async (payload: ReviewDraft): Promise<Review> => {
    const { assignment_id, ...body } = payload;
    const { data } = await apiClient.post<Review>(`${ASSIGNMENTS}/${assignment_id}/review`, body);
    return data;
  },

  /**
   * Submit updated review content for an assignment.
   */
  update: async (payload: ReviewUpdatePayload): Promise<Review> => {
    const { assignment_id, ...body } = payload;
    const { data } = await apiClient.post<Review>(`${ASSIGNMENTS}/${assignment_id}/review`, body);
    return data;
  },
} as const;
