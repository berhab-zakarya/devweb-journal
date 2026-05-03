/**
 * Publication Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsService } from '../services/publications.service';
import { publicationsKeys } from '../queries/publications.keys';
import type {
  PublicationDraft,
  PublicationUpdatePayload,
} from '../types/Publication.types';

/**
 * Create a new publication.
 */
export function useCreatePublicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PublicationDraft) => publicationsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publicationsKeys.lists() });
    },
  });
}

/**
 * Update an existing publication.
 */
export function useUpdatePublicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PublicationUpdatePayload) => publicationsService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: publicationsKeys.lists() });
      queryClient.setQueryData(publicationsKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a publication.
 */
export function useDeletePublicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publicationsService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: publicationsKeys.lists() });
      queryClient.removeQueries({ queryKey: publicationsKeys.detail(id) });
    },
  });
}
