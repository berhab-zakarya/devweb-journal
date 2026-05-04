'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsService } from '../services/publications.service';
import { publicationsKeys } from '../queries/publications.keys';
import type { PublishArticlePayload } from '../types/Publication.types';

export function usePublishArticleMutation(articleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PublishArticlePayload) => publicationsService.publish(articleId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: publicationsKeys.lists() }),
  });
}
