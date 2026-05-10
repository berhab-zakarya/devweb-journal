export type AssignmentStatus = 'pending' | 'accepted' | 'decline' | 'complete';
export type AssignmentResponse = 'accepted' | 'decline';
export type Recommendation = 'accept' | 'reject' | 'minor_revision' | 'major_revision';

export interface AssignmentArticle {
  id: number;
  title: string;
  abstract: string;
  status: string;
}

export interface Assignment {
  id: number;
  article_id: number;
  article?: AssignmentArticle;
  reviewer_id: number;
  due_date: string;
  response: AssignmentResponse | null;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AssignmentReview {
  id: number;
  assignment_id: number;
  article_version_id?: number;
  originality_score: number | null;
  methodology_score: number | null;
  clarity_score: number | null;
  overall_score: number | null;
  comments: string;
  recommendation: Recommendation | null;
  is_draft: boolean;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmitReviewPayload {
  is_draft: boolean;
  originality_score?: number | null;
  methodology_score?: number | null;
  clarity_score?: number | null;
  overall_score?: number | null;
  recommendation?: Recommendation | null;
  comments?: string | null;
}
