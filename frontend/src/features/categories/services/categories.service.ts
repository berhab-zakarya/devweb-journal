import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types/Category.types';

const BASE = ENDPOINTS.CATEGORIES_BASE;

export const categoriesService = {
  getList: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<{ data: Category[] }>(BASE);
    return data.data;
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post<{ message: string; data: Category }>(BASE, payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.put<{ message: string; data: Category }>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
