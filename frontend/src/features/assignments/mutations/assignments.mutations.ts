/**
 * Assignment Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService } from '../services/assignments.service';
import { assignmentsKeys } from '../queries/assignments.keys';
import type {
  AssignmentDraft,
  AssignmentUpdatePayload,
} from '../types/Assignment.types';

/**
 * Create a new assignment.
 */
export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignmentDraft) => assignmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
    },
  });
}

/**
 * Update an existing assignment.
 */
export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignmentUpdatePayload) => assignmentsService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
      queryClient.setQueryData(assignmentsKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a assignment.
 */
export function useDeleteAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentsService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.lists() });
      queryClient.removeQueries({ queryKey: assignmentsKeys.detail(id) });
    },
  });
}
