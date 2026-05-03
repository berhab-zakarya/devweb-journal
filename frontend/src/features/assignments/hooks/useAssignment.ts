/**
 * useAssignment hook
 *
 * Fetches a single assignment by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { assignmentsDetailQueryOptions } from '../queries/assignments.queries';

export function useAssignment(id: string) {
  return useQuery(assignmentsDetailQueryOptions(id));
}
