export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {
  id: number;
}

export interface CategoryFilters {
  search?: string;
  page?: number;
}

export interface PaginatedCategories {
  data: Category[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
