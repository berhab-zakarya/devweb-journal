/**
 * useReview hook
 *
 * Fetches a single review by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { reviewsDetailQueryOptions } from '../queries/reviews.queries';

export function useReview(assignmentId: number) {
  return useQuery(reviewsDetailQueryOptions(assignmentId));
}
