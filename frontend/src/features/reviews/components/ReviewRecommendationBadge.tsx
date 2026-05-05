'use client';

import type { ReviewRecommendation } from '@/features/articles/types/Article.types';
import { cn } from '@/shared/utils/cn';

const LABEL: Record<ReviewRecommendation, string> = {
  accept: 'Accept',
  reject: 'Reject',
  minor_revision: 'Minor revision',
  major_revision: 'Major revision',
};

const STYLE: Record<ReviewRecommendation, string> = {
  accept: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  minor_revision: 'bg-amber-100 text-amber-900',
  major_revision: 'bg-orange-100 text-orange-900',
};

export function ReviewRecommendationBadge({
  recommendation,
}: Readonly<{
  recommendation: ReviewRecommendation | null | undefined;
}>) {
  if (!recommendation) {
    return <span className="text-xs text-muted">—</span>;
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        STYLE[recommendation]
      )}
    >
      {LABEL[recommendation]}
    </span>
  );
}
