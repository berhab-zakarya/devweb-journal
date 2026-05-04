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
export function useCreateReviewMutation(assignmentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewDraft) => reviewsService.create(assignmentId, payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      queryClient.setQueryData(reviewsKeys.detail(created.assignment_id), created);
    },
  });
}

/**
 * Update an existing review.
 */
export function useUpdateReviewMutation(assignmentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewUpdatePayload) => reviewsService.update(assignmentId, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      queryClient.setQueryData(reviewsKeys.detail(updated.assignment_id), updated);
    },
  });
}
