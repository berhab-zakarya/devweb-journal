/**
 * Auth Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { authKeys } from './auth.keys';
import type { AuthFilters } from '../types/Auth.types';

/**
 * Query options for fetching a paginated list of auths.
 */
export const authListQueryOptions = (filters?: AuthFilters) =>
  queryOptions({
    queryKey: authKeys.list(filters),
    queryFn: () => authService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single auth by ID.
 */
export const authDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: authKeys.detail(id),
    queryFn: () => authService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
