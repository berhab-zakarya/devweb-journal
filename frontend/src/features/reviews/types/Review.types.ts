/**
 * Review Domain Types
 *
 * All types for the reviews feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Review {
  id: number;
  assignment_id: number;
  comments: string;
  recommendation: string;
  is_draft: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ReviewDraft {
  assignment_id: number;
  comments: string;
  recommendation: string;
  is_draft: boolean;
}

export interface ReviewUpdatePayload {
  assignment_id: number;
  comments: string;
  recommendation: string;
  is_draft: boolean;
}

export interface ReviewFilters {
  article_id: number;
}

export type ReviewsResponse = Review[];
