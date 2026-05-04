/**
 * useReviews hook
 *
 * Composes query options + useQuery for listing reviews.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { reviewsListQueryOptions } from '../queries/reviews.queries';
import type { ReviewFilters } from '../types/Review.types';

export function useReviews(filters?: ReviewFilters) {
  return useQuery(reviewsListQueryOptions(filters));
}
