/**
 * Review Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { reviewsKeys } from '../queries/reviews.keys';
import type {
  ReviewDraft,
  ReviewUpdatePayload,
} from '../types/Review.types';

/**
 * Create a new review.
 */
export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewDraft) => reviewsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
    },
  });
}

/**
 * Update an existing review.
 */
export function useUpdateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewUpdatePayload) => reviewsService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      queryClient.setQueryData(reviewsKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a review.
 */
export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      queryClient.removeQueries({ queryKey: reviewsKeys.detail(id) });
    },
  });
}
