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

const BASE = ENDPOINTS.REVIEWS_BASE;

export const reviewsService = {
  /**
   * Fetch a paginated list of reviews.
   */
  getAll: async (filters?: ReviewFilters): Promise<ReviewsResponse> => {
    const { data } = await apiClient.get<ReviewsResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single review by ID.
   */
  getById: async (id: string): Promise<Review> => {
    const { data } = await apiClient.get<Review>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new review.
   */
  create: async (payload: ReviewDraft): Promise<Review> => {
    const { data } = await apiClient.post<Review>(BASE, payload);
    return data;
  },

  /**
   * Update an existing review.
   */
  update: async ({ id, ...payload }: ReviewUpdatePayload): Promise<Review> => {
    const { data } = await apiClient.patch<Review>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a review by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
