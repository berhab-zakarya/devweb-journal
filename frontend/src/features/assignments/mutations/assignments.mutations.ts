'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService } from '../services/assignments.service';
import { assignmentsKeys } from '../queries/assignments.keys';
import type { SubmitReviewPayload } from '../types/Assignment.types';

export function useRespondMutation(assignmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (response: 'accepted' | 'decline') => assignmentsService.respond(assignmentId, response),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentsKeys.all });
    },
  });
}

export function useSubmitReviewMutation(assignmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => assignmentsService.submitReview(assignmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentsKeys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
