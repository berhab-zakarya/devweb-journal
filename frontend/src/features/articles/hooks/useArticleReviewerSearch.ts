import { useQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';

export function useArticleReviewerSearch(articleId: number, q: string, limit = 25) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ['articles', articleId, 'reviewer-search', trimmed, limit],
    queryFn: () => articlesService.searchReviewers(articleId, trimmed || undefined, limit),
    // Fires immediately with an empty query to pre-load all available reviewers.
    enabled: articleId > 0,
    staleTime: 30_000,
  });
}
