import { useQuery } from '@tanstack/react-query';
import { articleVersionsQueryOptions } from '../queries/articles.queries';

export function useArticleVersions(articleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    ...articleVersionsQueryOptions(articleId),
    enabled: (options?.enabled ?? true) && articleId > 0,
  });
}
