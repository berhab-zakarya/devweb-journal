import { useQuery } from '@tanstack/react-query';
import { assignmentsMineQueryOptions } from '../queries/assignments.queries';

export function useMyAssignments() {
  return useQuery(assignmentsMineQueryOptions());
}
