/**
 * User Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { usersKeys } from './users.keys';
import type { UserFilters } from '../types/User.types';

/**
 * Query options for fetching a paginated list of users.
 */
export const usersListQueryOptions = (filters?: UserFilters) =>
  queryOptions({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single user by ID.
 */
export const usersDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
