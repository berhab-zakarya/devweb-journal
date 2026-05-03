/**
 * Article Service
 *
 * This is the ONLY place where API calls for the articles feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Article,
  ArticleDraft,
  ArticleUpdatePayload,
  ArticleFilters,
  ArticlesResponse,
} from '../types/Article.types';

const BASE = ENDPOINTS.ARTICLES_BASE;

export const articlesService = {
  /**
   * Fetch a paginated list of articles.
   */
  getAll: async (filters?: ArticleFilters): Promise<ArticlesResponse> => {
    const { data } = await apiClient.get<ArticlesResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single article by ID.
   */
  getById: async (id: string): Promise<Article> => {
    const { data } = await apiClient.get<Article>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new article.
   */
  create: async (payload: ArticleDraft): Promise<Article> => {
    const { data } = await apiClient.post<Article>(BASE, payload);
    return data;
  },

  /**
   * Update an existing article.
   */
  update: async ({ id, ...payload }: ArticleUpdatePayload): Promise<Article> => {
    const { data } = await apiClient.patch<Article>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a article by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
