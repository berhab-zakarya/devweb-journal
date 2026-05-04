import type { ArticleFilters } from '../types/Article.types';

export const articlesKeys = {
  all: ['articles'] as const,
  lists: () => [...articlesKeys.all, 'list'] as const,
  list: (filters?: ArticleFilters) => [...articlesKeys.lists(), { filters }] as const,
  details: () => [...articlesKeys.all, 'detail'] as const,
  detail: (id: number) => [...articlesKeys.details(), id] as const,
  versions: (articleId: number) => [...articlesKeys.all, 'versions', articleId] as const,
  assignments: (articleId: number) => [...articlesKeys.all, 'assignments', articleId] as const,
  reviews: (articleId: number) => [...articlesKeys.all, 'reviews', articleId] as const,
  decision: (articleId: number) => [...articlesKeys.all, 'decision', articleId] as const,
  assignmentReview: (assignmentId: number) => [...articlesKeys.all, 'assignmentReview', assignmentId] as const,
} as const;
