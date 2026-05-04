import { useQuery } from '@tanstack/react-query';
import { articleAssignmentsQueryOptions } from '../queries/articles.queries';

export function useArticleAssignments(articleId: number) {
  return useQuery(articleAssignmentsQueryOptions(articleId));
}
