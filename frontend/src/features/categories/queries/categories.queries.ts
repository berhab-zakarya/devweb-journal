/**
 * Category Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import { categoriesKeys } from './categories.keys';
import type { CategoryFilters } from '../types/Category.types';

/**
 * Query options for fetching a paginated list of categories.
 */
export const categoriesListQueryOptions = (filters?: CategoryFilters) =>
  queryOptions({
    queryKey: categoriesKeys.list(filters),
    queryFn: () => categoriesService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single category by ID.
 */
export const categoriesDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: categoriesKeys.detail(id),
    queryFn: () => categoriesService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
