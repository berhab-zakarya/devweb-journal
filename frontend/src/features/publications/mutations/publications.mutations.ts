'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/dashboard/queries/dashboard.keys';
import { articlesKeys } from '@/features/articles/queries/articles.keys';
import { publicationsService } from '../services/publications.service';
import { publicationsKeys } from '../queries/publications.keys';
import type { PublishArticlePayload } from '../types/Publication.types';

export function usePublishArticleMutation(articleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PublishArticlePayload) => publicationsService.publish(articleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: publicationsKeys.all });
      qc.invalidateQueries({ queryKey: articlesKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}
