/**
 * useArticles hook
 *
 * Composes query options + useQuery for listing articles.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { articlesListQueryOptions } from '../queries/articles.queries';
import type { ArticleFilters } from '../types/Article.types';

export function useArticles(filters?: ArticleFilters) {
  return useQuery(articlesListQueryOptions(filters));
}
