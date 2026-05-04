import { useQuery } from '@tanstack/react-query';
import { assignmentsDetailQueryOptions } from '../queries/assignments.queries';

export function useAssignment(id: number) {
  return useQuery(assignmentsDetailQueryOptions(id));
}
