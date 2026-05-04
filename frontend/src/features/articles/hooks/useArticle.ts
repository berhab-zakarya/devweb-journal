import { useQuery } from '@tanstack/react-query';
import { articlesDetailQueryOptions } from '../queries/articles.queries';

export function useArticle(id: number) {
  return useQuery(articlesDetailQueryOptions(id));
}
