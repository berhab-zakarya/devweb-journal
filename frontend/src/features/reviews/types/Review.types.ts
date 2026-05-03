/**
 * Review Domain Types
 *
 * All types for the reviews feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Review {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Review-specific fields here
}

export interface ReviewDraft {
  // TODO: fields required to create a new Review
}

export interface ReviewUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface ReviewFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Review;
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
