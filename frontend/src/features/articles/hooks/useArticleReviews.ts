import { useQuery } from '@tanstack/react-query';
import { articleReviewsQueryOptions } from '../queries/articles.queries';

export function useArticleReviews(articleId: number) {
  return useQuery(articleReviewsQueryOptions(articleId));
}
