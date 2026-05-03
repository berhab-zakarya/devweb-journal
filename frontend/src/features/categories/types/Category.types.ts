/**
 * Category Domain Types
 *
 * All types for the categories feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Category {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Category-specific fields here
}

export interface CategoryDraft {
  // TODO: fields required to create a new Category
}

export interface CategoryUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface CategoryFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Category;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
