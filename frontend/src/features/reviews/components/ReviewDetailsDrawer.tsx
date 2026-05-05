'use client';

import { Modal, Button } from '@/shared/components/ui';
import type { ArticleReview } from '@/features/articles/types/Article.types';
import { ReviewRecommendationBadge } from './ReviewRecommendationBadge';
import { ReviewScoresGrid } from './ReviewScoresGrid';
import { ReviewStatusBadge } from './ReviewStatusBadge';

export function ReviewDetailsDrawer({
  review,
  open,
  onClose,
}: Readonly<{
  review: ArticleReview | null;
  open: boolean;
  onClose: () => void;
}>) {
  if (!review) return null;

  return (
    <Modal open={open} onClose={onClose} title="Review details">
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <ReviewStatusBadge isDraft={review.is_draft} isSubmitted={review.is_submitted} />
          <ReviewRecommendationBadge recommendation={review.recommendation} />
        </div>
        <ReviewScoresGrid
          originality={review.originality_score}
          methodology={review.methodology_score}
          clarity={review.clarity_score}
          overall={review.overall_score}
        />
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Comments</p>
          <p className="text-secondary whitespace-pre-wrap">{review.comments || '—'}</p>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
