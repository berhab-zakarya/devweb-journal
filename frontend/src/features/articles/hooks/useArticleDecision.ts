import { useQuery } from '@tanstack/react-query';
import { articleDecisionQueryOptions } from '../queries/articles.queries';

export function useArticleDecision(articleId: number) {
  return useQuery(articleDecisionQueryOptions(articleId));
}
