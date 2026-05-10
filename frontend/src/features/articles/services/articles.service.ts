import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import { normalizeLaravelPaginator, normalizeSimpleCollection, unwrapData } from '@/shared/api/response';
import type {
  Article,
  ArticleVersion,
  ArticleAssignment,
  ArticleReview,
  EditorialDecision,
  EditorialDecisionResponse,
  ReviewerSearchResult,
  ArticleFilters,
  CreateArticlePayload,
  UpdateArticlePayload,
  CreateVersionPayload,
  CreateVersionResponse,
  CreateDecisionPayload,
  AssignReviewersPayload,
  RespondAssignmentPayload,
  SubmitReviewPayload,
  ArticlesListResult,
} from '../types/Article.types';

const BASE = ENDPOINTS.ARTICLES_BASE;
const ASSIGN = ENDPOINTS.ASSIGNMENTS_BASE;

export const articlesService = {
  getAll: async (filters?: ArticleFilters): Promise<ArticlesListResult> => {
    const response = await apiClient.get(BASE, { params: filters });
    return normalizeLaravelPaginator<Article>(response);
  },

  getById: async (id: number): Promise<Article> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return unwrapData<Article>({ data }) as Article;
  },

  create: async (payload: CreateArticlePayload): Promise<Article> => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('abstract', payload.abstract);
    form.append('keywords', payload.keywords);
    form.append('category_id', String(payload.category_id));
    form.append('pdf', payload.pdf);
    const { data } = await apiClient.post(BASE, form);
    return unwrapData<Article>({ data }) as Article;
  },

  update: async (id: number, payload: UpdateArticlePayload): Promise<Article> => {
    const { data } = await apiClient.put(`${BASE}/${id}`, payload);
    return unwrapData<Article>({ data }) as Article;
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
    const { data } = await apiClient.get(`${BASE}/${articleId}/versions`);
    return normalizeSimpleCollection<ArticleVersion>({ data });
  },

  createVersion: async (articleId: number, payload: CreateVersionPayload): Promise<CreateVersionResponse> => {
    const form = new FormData();
    form.append('pdf', payload.pdf);
    if (payload.change_summary?.trim()) {
      form.append('change_summary', payload.change_summary);
    }
    const { data } = await apiClient.post(`${BASE}/${articleId}/versions`, form);
    return unwrapData<CreateVersionResponse>({ data }) as CreateVersionResponse;
  },

  downloadVersion: async (articleId: number, versionId: number): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`${BASE}/${articleId}/versions/${versionId}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  // Assignments
  getAssignments: async (articleId: number): Promise<ArticleAssignment[]> => {
    const { data } = await apiClient.get(`${BASE}/${articleId}/assignments`);
    return normalizeSimpleCollection<ArticleAssignment>({ data });
  },

  assignReviewers: async (articleId: number, payload: AssignReviewersPayload): Promise<ArticleAssignment[]> => {
    const { data } = await apiClient.post(`${BASE}/${articleId}/assignments`, payload);
    return normalizeSimpleCollection<ArticleAssignment>({ data });
  },

  searchReviewers: async (articleId: number, q?: string, limit?: number): Promise<ReviewerSearchResult[]> => {
    const { data } = await apiClient.get(`${BASE}/${articleId}/reviewers/search`, {
      params: { q: q || undefined, limit },
    });
    return normalizeSimpleCollection<ReviewerSearchResult>({ data });
  },

  getAssignment: async (assignmentId: number): Promise<ArticleAssignment> => {
    const { data } = await apiClient.get(`${ASSIGN}/${assignmentId}`);
    return unwrapData<ArticleAssignment>({ data }) as ArticleAssignment;
  },

  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`${ASSIGN}/${assignmentId}`);
  },

  respondAssignment: async (assignmentId: number, payload: RespondAssignmentPayload): Promise<ArticleAssignment> => {
    const { data } = await apiClient.patch(`${ASSIGN}/${assignmentId}/respond`, payload);
    return unwrapData<ArticleAssignment>({ data }) as ArticleAssignment;
  },

  // Reviews
  getReviews: async (articleId: number): Promise<ArticleReview[]> => {
    const { data } = await apiClient.get(`${BASE}/${articleId}/reviews`);
    return normalizeSimpleCollection<ArticleReview>({ data });
  },

  getAssignmentReview: async (assignmentId: number): Promise<ArticleReview> => {
    const { data } = await apiClient.get(`${ASSIGN}/${assignmentId}/review`);
    return unwrapData<ArticleReview>({ data }) as ArticleReview;
  },

  submitReview: async (assignmentId: number, payload: SubmitReviewPayload): Promise<ArticleReview> => {
    const { data } = await apiClient.post(`${ASSIGN}/${assignmentId}/review`, payload);
    return unwrapData<ArticleReview>({ data }) as ArticleReview;
  },

  // Editorial decision
  getDecision: async (articleId: number): Promise<EditorialDecisionResponse> => {
    const { data } = await apiClient.get(`${BASE}/${articleId}/decision`);
    return unwrapData<EditorialDecisionResponse>({ data }) as EditorialDecisionResponse;
  },

  createDecision: async (articleId: number, payload: CreateDecisionPayload): Promise<EditorialDecision> => {
    const { data } = await apiClient.post(`${BASE}/${articleId}/decision`, payload);
    return unwrapData<EditorialDecision>({ data }) as EditorialDecision;
  },

  // Publish article
  publish: async (
    articleId: number,
    payload: { published_at?: string | null; doi?: string | null; volume?: string | null; issue?: string | null }
  ): Promise<{ id: number; article_id: number; article_version_id: number; published_at: string; doi: string | null; volume: string | null; issue: string | null; created_at: string; updated_at: string }> => {
    const { data } = await apiClient.post(`${BASE}/${articleId}/publish`, payload);
    return unwrapData<{
      id: number;
      article_id: number;
      article_version_id: number;
      published_at: string;
      doi: string | null;
      volume: string | null;
      issue: string | null;
      created_at: string;
      updated_at: string;
    }>({ data }) as {
      id: number;
      article_id: number;
      article_version_id: number;
      published_at: string;
      doi: string | null;
      volume: string | null;
      issue: string | null;
      created_at: string;
      updated_at: string;
    };
  },
} as const;
