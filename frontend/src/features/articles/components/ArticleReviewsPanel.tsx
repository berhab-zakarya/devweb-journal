'use client';

import { LoadingState, ErrorState, EmptyState } from '@/shared/components/ui';
import { FileText } from 'lucide-react';
import { useArticleReviews } from '../hooks/useArticleReviews';
import { ReviewSummaryCard } from '@/features/reviews/components/ReviewSummaryCard';

export function ArticleReviewsPanel({ articleId }: Readonly<{ articleId: number }>) {
  const q = useArticleReviews(articleId);
  const reviews = q.data ?? [];

  if (q.isLoading) return <LoadingState variant="list" rows={2} />;
  if (q.isError) {
    return <ErrorState message="Could not load reviews." onRetry={() => q.refetch()} />;
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-5 h-5" />}
        title="No reviews yet"
        description="Reviews will appear here once assigned reviewers submit them."
        className="py-8"
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <ReviewSummaryCard key={r.id} review={r} />
      ))}
    </div>
  );
}
