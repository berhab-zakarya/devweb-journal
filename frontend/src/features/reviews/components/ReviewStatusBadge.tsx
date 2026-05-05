'use client';

import { cn } from '@/shared/utils/cn';

export function ReviewStatusBadge({
  isDraft,
  isSubmitted,
}: Readonly<{ isDraft: boolean; isSubmitted: boolean }>) {
  const label = isSubmitted ? 'Submitted' : isDraft ? 'Draft' : 'In progress';
  const cls = isSubmitted
    ? 'bg-green-100 text-green-800'
    : isDraft
      ? 'bg-amber-100 text-amber-900'
      : 'bg-muted text-secondary';
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', cls)}>
      {label}
    </span>
  );
}
