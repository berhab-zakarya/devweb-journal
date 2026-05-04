/**
 * Review Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { reviewsKeys } from './reviews.keys';
import type { ReviewFilters } from '../types/Review.types';

/**
 * Query options for fetching reviews for a specific article.
 */
export const reviewsListQueryOptions = (filters?: ReviewFilters) =>
  queryOptions({
    queryKey: reviewsKeys.list(filters),
    queryFn: () => reviewsService.getAll(filters),
    enabled: Boolean(filters?.article_id),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single review by assignment ID.
 */
export const reviewsDetailQueryOptions = (assignmentId: number) =>
  queryOptions({
    queryKey: reviewsKeys.detail(assignmentId),
    queryFn: () => reviewsService.getById(assignmentId),
    enabled: assignmentId > 0,
    staleTime: 60_000,
  });
