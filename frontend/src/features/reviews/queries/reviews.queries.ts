/**
 * Review Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { reviewsKeys } from './reviews.keys';
import type { ReviewFilters } from '../types/Review.types';

/**
 * Query options for fetching a paginated list of reviews.
 */
export const reviewsListQueryOptions = (filters?: ReviewFilters) =>
  queryOptions({
    queryKey: reviewsKeys.list(filters),
    queryFn: () => reviewsService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single review by ID.
 */
export const reviewsDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: reviewsKeys.detail(id),
    queryFn: () => reviewsService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
