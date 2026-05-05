'use client';

import { Card, CardHeader } from '@/shared/components/ui';
import type { ArticleReview } from '@/features/articles/types/Article.types';
import { ReviewRecommendationBadge } from './ReviewRecommendationBadge';
import { ReviewScoresGrid } from './ReviewScoresGrid';

export function ReviewSummaryCard({ review }: Readonly<{ review: ArticleReview }>) {
  const reviewerName =
    review.assignment?.reviewer?.name ?? `Reviewer #${review.assignment?.reviewer_id ?? '?'}`;
  const status =
    review.is_submitted ? 'Submitted' : review.is_draft ? 'Draft' : 'In progress';

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-base font-semibold text-primary">{reviewerName}</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Status:</span>
            <span className="font-medium text-secondary">{status}</span>
            <ReviewRecommendationBadge recommendation={review.recommendation} />
          </div>
        </div>
      </CardHeader>
      <div className="mt-3 space-y-4">
        <ReviewScoresGrid
          originality={review.originality_score}
          methodology={review.methodology_score}
          clarity={review.clarity_score}
          overall={review.overall_score}
        />
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Comments</p>
          <p className="text-sm text-secondary whitespace-pre-wrap">{review.comments || '—'}</p>
        </div>
      </div>
    </Card>
  );
}
