import { useQuery } from '@tanstack/react-query';
import { articlesListQueryOptions } from '../queries/articles.queries';
import type { ArticleFilters } from '../types/Article.types';

export function useArticles(filters?: ArticleFilters) {
  return useQuery(articlesListQueryOptions(filters));
}
