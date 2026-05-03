/**
 * useReview hook
 *
 * Fetches a single review by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { reviewsDetailQueryOptions } from '../queries/reviews.queries';

export function useReview(id: string) {
  return useQuery(reviewsDetailQueryOptions(id));
}
