/**
 * Auth Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { authKeys } from '../queries/auth.keys';
import type {
  AuthDraft,
  AuthUpdatePayload,
} from '../types/Auth.types';

/**
 * Create a new auth.
 */
export function useCreateAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthDraft) => authService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.lists() });
    },
  });
}

/**
 * Update an existing auth.
 */
export function useUpdateAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthUpdatePayload) => authService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: authKeys.lists() });
      queryClient.setQueryData(authKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a auth.
 */
export function useDeleteAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: authKeys.lists() });
      queryClient.removeQueries({ queryKey: authKeys.detail(id) });
    },
  });
}
