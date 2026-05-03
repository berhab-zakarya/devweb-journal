/**
 * Article Domain Types
 *
 * All types for the articles feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Article {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Article-specific fields here
}

export interface ArticleDraft {
  // TODO: fields required to create a new Article
}

export interface ArticleUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface ArticleFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Article;
  sortOrder?: 'asc' | 'desc';
}

export interface ArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
