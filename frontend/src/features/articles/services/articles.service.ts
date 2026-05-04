import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Article,
  ArticleVersion,
  ArticleAssignment,
  ArticleReview,
  EditorialDecision,
  EditorialDecisionResponse,
  ReviewerSearchResult,
  ArticleFilters,
  PaginatedArticles,
  ArticleVersionsResponse,
  CreateArticlePayload,
  UpdateArticlePayload,
  CreateVersionPayload,
  CreateVersionResponse,
  CreateDecisionPayload,
  AssignReviewersPayload,
  RespondAssignmentPayload,
  SubmitReviewPayload,
  PaginatedResponse,
} from '../types/Article.types';

const BASE = ENDPOINTS.ARTICLES_BASE;
const ASSIGN = ENDPOINTS.ASSIGNMENTS_BASE;

export const articlesService = {
  getAll: async (filters?: ArticleFilters): Promise<PaginatedArticles> => {
    const { data } = await apiClient.get<{ data: PaginatedResponse<Article> }>(BASE, { params: filters });
    return { data: data.data };
  },

  getById: async (id: number): Promise<Article> => {
    const { data } = await apiClient.get<{ data: Article }>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: CreateArticlePayload): Promise<Article> => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('abstract', payload.abstract);
    form.append('keywords', payload.keywords);
    form.append('category_id', String(payload.category_id));
    form.append('pdf', payload.pdf);
    const { data } = await apiClient.post<{ message: string; data: Article }>(BASE, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (id: number, payload: UpdateArticlePayload): Promise<Article> => {
    const { data } = await apiClient.put<{ message: string; data: Article }>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  download: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`${BASE}/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  // Versions
  getVersions: async (articleId: number): Promise<ArticleVersion[]> => {
    const { data } = await apiClient.get<ArticleVersionsResponse>(`${BASE}/${articleId}/versions`);
    return data.data;
  },

  createVersion: async (articleId: number, payload: CreateVersionPayload): Promise<CreateVersionResponse> => {
    const form = new FormData();
    form.append('pdf', payload.pdf);
    if (payload.change_summary?.trim()) {
      form.append('change_summary', payload.change_summary);
    }
    const { data } = await apiClient.post<{ message: string; data: CreateVersionResponse }>(
      `${BASE}/${articleId}/versions`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.data;
  },

  downloadVersion: async (articleId: number, versionId: number): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`${BASE}/${articleId}/versions/${versionId}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  // Assignments
  getAssignments: async (articleId: number): Promise<ArticleAssignment[]> => {
    const { data } = await apiClient.get<{ data: ArticleAssignment[] }>(`${BASE}/${articleId}/assignments`);
    return data.data;
  },

  assignReviewers: async (articleId: number, payload: AssignReviewersPayload): Promise<ArticleAssignment[]> => {
    const { data } = await apiClient.post<{ message: string; data: ArticleAssignment[] }>(
      `${BASE}/${articleId}/assignments`,
      payload
    );
    return data.data;
  },

  searchReviewers: async (articleId: number, q: string, limit?: number): Promise<ReviewerSearchResult[]> => {
    const { data } = await apiClient.get<{ data: ReviewerSearchResult[] }>(
      `${BASE}/${articleId}/reviewers/search`,
      {
        params: { q, limit },
      }
    );
    return data.data;
  },

  getAssignment: async (assignmentId: number): Promise<ArticleAssignment> => {
    const { data } = await apiClient.get<{ data: ArticleAssignment }>(`${ASSIGN}/${assignmentId}`);
    return data.data;
  },

  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`${ASSIGN}/${assignmentId}`);
  },

  respondAssignment: async (assignmentId: number, payload: RespondAssignmentPayload): Promise<ArticleAssignment> => {
    const { data } = await apiClient.patch<{ message: string; data: ArticleAssignment }>(
      `${ASSIGN}/${assignmentId}/respond`,
      payload
    );
    return data.data;
  },

  // Reviews
  getReviews: async (articleId: number): Promise<ArticleReview[]> => {
    const { data } = await apiClient.get<{ data: ArticleReview[] }>(`${BASE}/${articleId}/reviews`);
    return data.data;
  },

  getAssignmentReview: async (assignmentId: number): Promise<ArticleReview> => {
    const { data } = await apiClient.get<{ data: ArticleReview }>(`${ASSIGN}/${assignmentId}/review`);
    return data.data;
  },

  submitReview: async (assignmentId: number, payload: SubmitReviewPayload): Promise<ArticleReview> => {
    const { data } = await apiClient.post<{ message: string; data: ArticleReview }>(
      `${ASSIGN}/${assignmentId}/review`,
      payload
    );
    return data.data;
  },

  // Editorial decision
  getDecision: async (articleId: number): Promise<EditorialDecisionResponse> => {
    const { data } = await apiClient.get<{ data: EditorialDecisionResponse }>(`${BASE}/${articleId}/decision`);
    return data.data;
  },

  createDecision: async (articleId: number, payload: CreateDecisionPayload): Promise<EditorialDecision> => {
    const { data } = await apiClient.post<{ message: string; data: EditorialDecision }>(
      `${BASE}/${articleId}/decision`,
      payload
    );
    return data.data;
  },

  // Publish article
  publish: async (
    articleId: number,
    payload: { published_at?: string | null; doi?: string | null; volume?: string | null; issue?: string | null }
  ): Promise<{ id: number; article_id: number; article_version_id: number; published_at: string; doi: string | null; volume: string | null; issue: string | null; created_at: string; updated_at: string }> => {
    const { data } = await apiClient.post<{
      message: string;
      data: { id: number; article_id: number; article_version_id: number; published_at: string; doi: string | null; volume: string | null; issue: string | null; created_at: string; updated_at: string };
    }>(`${BASE}/${articleId}/publish`, payload);
    return data.data;
  },
} as const;
