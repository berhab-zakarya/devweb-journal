import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Article,
  ArticleVersion,
  ArticleAssignment,
  ArticleReview,
  EditorialDecision,
  ReviewerSearchResult,
  ArticleFilters,
  PaginatedArticles,
  ArticleVersionsResponse,
  CreateArticlePayload,
  UpdateArticlePayload,
  CreateVersionPayload,
  CreateDecisionPayload,
  AssignReviewersPayload,
  RespondAssignmentPayload,
  SubmitReviewPayload,
} from '../types/Article.types';

const BASE = ENDPOINTS.ARTICLES_BASE;
const ASSIGN = ENDPOINTS.ASSIGNMENTS_BASE;

export const articlesService = {
  getAll: async (filters?: ArticleFilters): Promise<PaginatedArticles> => {
    const { data } = await apiClient.get<PaginatedArticles>(BASE, { params: filters });
    return data;
  },

  getById: async (id: number): Promise<Article> => {
    const { data } = await apiClient.get<Article>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateArticlePayload): Promise<Article> => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('abstract', payload.abstract);
    form.append('keywords', payload.keywords);
    form.append('category_id', String(payload.category_id));
    form.append('pdf', payload.pdf);
    const { data } = await apiClient.post<Article>(BASE, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, payload: UpdateArticlePayload): Promise<Article> => {
    const { data } = await apiClient.put<Article>(`${BASE}/${id}`, payload);
    return data;
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

  createVersion: async (articleId: number, payload: CreateVersionPayload): Promise<ArticleVersion> => {
    const form = new FormData();
    form.append('pdf', payload.pdf);
    if (payload.change_summary?.trim()) {
      form.append('change_summary', payload.change_summary);
    }
    const { data } = await apiClient.post<ArticleVersion>(`${BASE}/${articleId}/versions`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Assignments
  getAssignments: async (articleId: number): Promise<ArticleAssignment[]> => {
    const { data } = await apiClient.get<ArticleAssignment[]>(`${BASE}/${articleId}/assignments`);
    return data;
  },

  assignReviewers: async (articleId: number, payload: AssignReviewersPayload): Promise<ArticleAssignment[]> => {
    const { data } = await apiClient.post<ArticleAssignment[]>(`${BASE}/${articleId}/assignments`, payload);
    return data;
  },

  searchReviewers: async (articleId: number, q: string, limit?: number): Promise<ReviewerSearchResult[]> => {
    const { data } = await apiClient.get<ReviewerSearchResult[]>(`${BASE}/${articleId}/reviewers/search`, {
      params: { q, limit },
    });
    return data;
  },

  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`${ASSIGN}/${assignmentId}`);
  },

  respondAssignment: async (assignmentId: number, payload: RespondAssignmentPayload): Promise<ArticleAssignment> => {
    const { data } = await apiClient.patch<ArticleAssignment>(`${ASSIGN}/${assignmentId}/respond`, payload);
    return data;
  },

  // Reviews
  getReviews: async (articleId: number): Promise<ArticleReview[]> => {
    const { data } = await apiClient.get<ArticleReview[]>(`${BASE}/${articleId}/reviews`);
    return data;
  },

  getAssignmentReview: async (assignmentId: number): Promise<ArticleReview> => {
    const { data } = await apiClient.get<ArticleReview>(`${ASSIGN}/${assignmentId}/review`);
    return data;
  },

  submitReview: async (assignmentId: number, payload: SubmitReviewPayload): Promise<ArticleReview> => {
    const { data } = await apiClient.post<ArticleReview>(`${ASSIGN}/${assignmentId}/review`, payload);
    return data;
  },

  // Editorial decision
  getDecision: async (articleId: number): Promise<EditorialDecision> => {
    const { data } = await apiClient.get<EditorialDecision>(`${BASE}/${articleId}/decision`);
    return data;
  },

  createDecision: async (articleId: number, payload: CreateDecisionPayload): Promise<EditorialDecision> => {
    const { data } = await apiClient.post<EditorialDecision>(`${BASE}/${articleId}/decision`, payload);
    return data;
  },
} as const;
