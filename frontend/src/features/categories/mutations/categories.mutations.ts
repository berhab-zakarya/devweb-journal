/**
 * Category Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import { categoriesKeys } from '../queries/categories.keys';
import type {
  CategoryDraft,
  CategoryUpdatePayload,
} from '../types/Category.types';

/**
 * Create a new category.
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryDraft) => categoriesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },
  });
}

/**
 * Update an existing category.
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryUpdatePayload) => categoriesService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.setQueryData(categoriesKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a category.
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.removeQueries({ queryKey: categoriesKeys.detail(id) });
    },
  });
}
