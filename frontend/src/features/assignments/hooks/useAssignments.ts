/**
 * useAssignments hook
 *
 * Composes query options + useQuery for listing assignments.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { assignmentsListQueryOptions } from '../queries/assignments.queries';
import type { AssignmentFilters } from '../types/Assignment.types';

export function useAssignments(filters?: AssignmentFilters) {
  return useQuery(assignmentsListQueryOptions(filters));
}
