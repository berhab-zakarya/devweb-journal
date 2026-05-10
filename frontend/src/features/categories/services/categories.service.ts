import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import { normalizeSimpleCollection, unwrapData } from '@/shared/api/response';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types/Category.types';

const BASE = ENDPOINTS.CATEGORIES_BASE;

export const categoriesService = {
  getList: async (): Promise<Category[]> => {
    const { data } = await apiClient.get(BASE);
    return normalizeSimpleCollection<Category>({ data });
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post(BASE, payload);
    return unwrapData<Category>({ data }) as Category;
  },

  update: async (id: number, payload: UpdateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.put(`${BASE}/${id}`, payload);
    return unwrapData<Category>({ data }) as Category;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
