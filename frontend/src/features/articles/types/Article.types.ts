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
export type ReviewRecommendation = 'accept' | 'reject' | 'minor_revision' | 'major_revision';

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

export interface ArticleStatusHistoryEntry {
  status: string;
  changed_at: string;
  note?: string;
}

export interface ArticlePublication {
  id: number;
  article_id: number;
  published_at: string;
  doi?: string | null;
  volume?: string | null;
  issue?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  author_id: number;
  category_id: number;
  title: string;
  abstract: string;
  keywords: string;
  status: ArticleStatus;
  status_history: ArticleStatusHistoryEntry[];
  current_version_id: number;
  submitted_at: string;
  is_published: boolean;
  published_at: string | null;
  author: ArticleAuthor;
  category: ArticleCategory;
  publication: ArticlePublication | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleVersion {
  id: number;
  article_id: number;
  version_number: number;
  pdf_path: string;
  pdf_original_name: string;
  pdf_size: number;
  change_summary: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleVersionsResponse {
  data: ArticleVersion[];
}

export interface ArticleAssignment {
  id: number;
  article_id: number;
  reviewer_id: number;
  status: AssignmentStatus;
  due_date: string | null;
  assigned_by?: number | null;
  assigned_at?: string;
  reviewer?: ArticleAuthor;
  created_at?: string;
}

export interface ArticleReview {
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
  assignment?: ArticleAssignment;
  created_at: string;
  updated_at: string;
}

export interface EditorialDecision {
  id: number;
  article_id: number;
  editor_id: number;
  decision: DecisionType;
  stage: string;
  comments: string;
  decided_at: string;
  created_at: string;
  updated_at: string;
}

export interface EditorialDecisionResponse {
  latest: EditorialDecision | null;
  latest_proposal?: EditorialDecision | null;
  latest_final?: EditorialDecision | null;
  history: EditorialDecision[];
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

export interface PaginatorLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatorMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginatorLinks;
  meta: PaginatorMeta;
}

export interface PaginatedArticles {
  data: PaginatedResponse<Article>;
}

export interface CreateArticlePayload {
  title: string;
  abstract: string;
  keywords: string;
  category_id: number;
  pdf: File;
}

export interface UpdateArticlePayload {
  title?: string;
  abstract?: string;
  keywords?: string;
  category_id?: number;
}

export interface CreateVersionPayload {
  pdf: File;
  change_summary?: string | null;
}

export interface CreateVersionResponse {
  article_id: number;
  current_version_id: number;
  status: ArticleStatus;
}

export interface CreateDecisionPayload {
  decision: DecisionType;
  comments: string;
}

export interface AssignReviewersPayload {
  reviewer_ids: number[];
  due_date?: string | null;
}

export interface RespondAssignmentPayload {
  response: AssignmentResponse;
}

export interface SubmitReviewPayload {
  is_draft?: boolean | null;
  comments?: string;
  originality_score?: number;
  methodology_score?: number;
  clarity_score?: number;
  overall_score?: number;
  recommendation?: ReviewRecommendation;
}
