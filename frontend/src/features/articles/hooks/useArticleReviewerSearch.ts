import { useQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';

export function useArticleReviewerSearch(articleId: number, q: string, limit = 10) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ['articles', articleId, 'reviewer-search', trimmed, limit],
    queryFn: () => articlesService.searchReviewers(articleId, trimmed, limit),
    enabled: articleId > 0 && trimmed.length >= 2,
    staleTime: 30_000,
  });
}
