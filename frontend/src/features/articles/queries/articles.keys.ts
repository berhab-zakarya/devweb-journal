/**
 * Article Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All articles queries/mutations reference keys from here.
 */

import type { ArticleFilters } from '../types/Article.types';

export const articlesKeys = {
  /** Base key for all articles queries */
  all: ['articles'] as const,

  /** All list variants */
  lists: () => [...articlesKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: ArticleFilters) =>
    [...articlesKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...articlesKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...articlesKeys.details(), id] as const,
} as const;
