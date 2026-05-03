/**
 * Assignment Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { assignmentsService } from '../services/assignments.service';
import { assignmentsKeys } from './assignments.keys';
import type { AssignmentFilters } from '../types/Assignment.types';

/**
 * Query options for fetching a paginated list of assignments.
 */
export const assignmentsListQueryOptions = (filters?: AssignmentFilters) =>
  queryOptions({
    queryKey: assignmentsKeys.list(filters),
    queryFn: () => assignmentsService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single assignment by ID.
 */
export const assignmentsDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: assignmentsKeys.detail(id),
    queryFn: () => assignmentsService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
