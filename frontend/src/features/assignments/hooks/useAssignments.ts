import { useQuery } from '@tanstack/react-query';
import { assignmentsDetailQueryOptions } from '../queries/assignments.queries';

// Alias kept for backward compat — use useAssignment(id) for specific assignments
export function useAssignments(id: number) {
  return useQuery(assignmentsDetailQueryOptions(id));
}
