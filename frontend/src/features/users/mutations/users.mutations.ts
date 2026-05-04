'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { usersKeys } from '../queries/users.keys';
import type { CreateUserPayload, UpdateUserPayload, AssignRolePayload } from '../types/User.types';

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.lists() }),
  });
}

export function useUpdateUserMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.lists() }),
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.lists() }),
  });
}

export function useAssignRoleMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRolePayload) => usersService.assignRole(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.lists() }),
  });
}
