/**
 * Review Domain Types
 *
 * All types for the reviews feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export type ReviewRecommendation = 'accept' | 'reject' | 'minor_revision' | 'major_revision';

export interface Review {
  id: number;
  assignment_id: number;
  article_version_id: number;
  originality_score?: number | null;
  methodology_score?: number | null;
  clarity_score?: number | null;
  overall_score?: number | null;
  comments: string;
  recommendation?: ReviewRecommendation;
  is_draft: boolean;
  is_submitted: boolean;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewDraft {
  assignment_id: number;
  is_draft: boolean;
  comments?: string;
  originality_score?: number;
  methodology_score?: number;
  clarity_score?: number;
  overall_score?: number;
  recommendation?: ReviewRecommendation;
}

export interface ReviewUpdatePayload {
  is_draft?: boolean | null;
  comments?: string;
  originality_score?: number;
  methodology_score?: number;
  clarity_score?: number;
  overall_score?: number;
  recommendation?: ReviewRecommendation;
}

export interface ReviewFilters {
  article_id: number;
}

export type ReviewsResponse = Review[];
