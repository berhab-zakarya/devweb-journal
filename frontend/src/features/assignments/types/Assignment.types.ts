export type AssignmentStatus = 'pending' | 'accepted' | 'decline' | 'complete';
export type AssignmentResponse = 'accepted' | 'decline';

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
  comments: string;
  recommendation: string;
  is_draft: boolean;
  created_at: string;
}

export interface SubmitReviewPayload {
  comments: string;
  recommendation: string;
  is_draft: boolean;
}
