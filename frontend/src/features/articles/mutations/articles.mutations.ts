/**
 * Article Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';
import { articlesKeys } from '../queries/articles.keys';
import type {
  ArticleDraft,
  ArticleUpdatePayload,
} from '../types/Article.types';

/**
 * Create a new article.
 */
export function useCreateArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ArticleDraft) => articlesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
    },
  });
}

/**
 * Update an existing article.
 */
export function useUpdateArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ArticleUpdatePayload) => articlesService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      queryClient.setQueryData(articlesKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a article.
 */
export function useDeleteArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      queryClient.removeQueries({ queryKey: articlesKeys.detail(id) });
    },
  });
}
