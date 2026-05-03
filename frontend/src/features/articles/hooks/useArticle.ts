/**
 * useArticle hook
 *
 * Fetches a single article by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { articlesDetailQueryOptions } from '../queries/articles.queries';

export function useArticle(id: string) {
  return useQuery(articlesDetailQueryOptions(id));
}
