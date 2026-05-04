export type ArticleStatus =
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'accepted'
  | 'rejected'
  | 'published';

export type DecisionType = 'accepted' | 'rejected' | 'revision_required';
export type AssignmentResponse = 'accepted' | 'decline';
export type AssignmentStatus = 'pending' | 'accepted' | 'decline' | 'complete';

export interface ArticleAuthor {
  id: number;
  name: string;
  email: string;
}

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  title: string;
  abstract: string;
  keywords: string;
  status: ArticleStatus;
  category_id: number;
  category?: ArticleCategory;
  author_id: number;
  author?: ArticleAuthor;
  created_at: string;
  updated_at: string;
}

export interface ArticleVersion {
  id: number;
  article_id: number;
  version_number: number;
  pdf_original_name: string;
  pdf_size: number;
  change_summary: string | null;
  submitted_at: string;
}

export interface ArticleVersionsResponse {
  data: ArticleVersion[];
}

export interface ArticleAssignment {
  id: number;
  article_id: number;
  reviewer_id: number;
  reviewer?: ArticleAuthor;
  due_date: string;
  response: AssignmentResponse | null;
  status: AssignmentStatus;
  created_at: string;
}

export interface ArticleReview {
  id: number;
  assignment_id: number;
  comments: string;
  recommendation: string;
  is_draft: boolean;
  created_at: string;
}

export interface EditorialDecision {
  id: number;
  article_id: number;
  decision: DecisionType;
  comments: string;
  created_at: string;
}

export interface ReviewerSearchResult {
  id: number;
  name: string;
  email: string;
}

export interface ArticleFilters {
  search?: string;
  page?: number;
}

export interface PaginatedArticles {
  data: Article[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateArticlePayload {
  title: string;
  abstract: string;
  keywords: string;
  category_id: number;
  pdf: File;
}

export interface UpdateArticlePayload {
  title: string;
  abstract: string;
  keywords: string;
  category_id: number;
}

export interface CreateVersionPayload {
  pdf: File;
  change_summary?: string;
}

export interface CreateDecisionPayload {
  decision: DecisionType;
  comments: string;
}

export interface AssignReviewersPayload {
  reviewer_ids: number[];
  due_date: string;
}

export interface RespondAssignmentPayload {
  response: AssignmentResponse;
}

export interface SubmitReviewPayload {
  comments: string;
  recommendation: string;
  is_draft: boolean;
}
