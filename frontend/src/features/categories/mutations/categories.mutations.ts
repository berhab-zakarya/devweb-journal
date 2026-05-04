'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import { categoriesKeys } from '../queries/categories.keys';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '../types/Category.types';

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKeys.lists() }),
  });
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => categoriesService.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKeys.lists() }),
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKeys.lists() }),
  });
}
