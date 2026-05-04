import { useQuery } from '@tanstack/react-query';
import { articleVersionsQueryOptions } from '../queries/articles.queries';

export function useArticleVersions(articleId: number) {
  return useQuery(articleVersionsQueryOptions(articleId));
}
