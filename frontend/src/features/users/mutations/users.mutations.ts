/**
 * User Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { usersKeys } from '../queries/users.keys';
import type {
  UserDraft,
  UserUpdatePayload,
} from '../types/User.types';

/**
 * Create a new user.
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserDraft) => usersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/**
 * Update an existing user.
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserUpdatePayload) => usersService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.setQueryData(usersKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a user.
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) });
    },
  });
}
