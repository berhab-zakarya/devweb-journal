import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryFilters,
  PaginatedCategories,
} from '../types/Category.types';

const BASE = ENDPOINTS.CATEGORIES_BASE;

export const categoriesService = {
  getAll: async (filters?: CategoryFilters): Promise<PaginatedCategories> => {
    const { data } = await apiClient.get<PaginatedCategories>(BASE, { params: filters });
    return data;
  },

  getList: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>(BASE);
    return data;
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post<Category>(BASE, payload);
    return data;
  },

  update: async ({ id, ...payload }: UpdateCategoryPayload): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`${BASE}/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
