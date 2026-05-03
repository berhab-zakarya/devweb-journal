/**
 * Category Service
 *
 * This is the ONLY place where API calls for the categories feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Category,
  CategoryDraft,
  CategoryUpdatePayload,
  CategoryFilters,
  CategoriesResponse,
} from '../types/Category.types';

const BASE = ENDPOINTS.CATEGORIES_BASE;

export const categoriesService = {
  /**
   * Fetch a paginated list of categories.
   */
  getAll: async (filters?: CategoryFilters): Promise<CategoriesResponse> => {
    const { data } = await apiClient.get<CategoriesResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single category by ID.
   */
  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new category.
   */
  create: async (payload: CategoryDraft): Promise<Category> => {
    const { data } = await apiClient.post<Category>(BASE, payload);
    return data;
  },

  /**
   * Update an existing category.
   */
  update: async ({ id, ...payload }: CategoryUpdatePayload): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a category by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
