'use client';

import { cn } from '@/shared/utils/cn';

export function NotificationFilters({
  onlyUnread,
  onChange,
}: Readonly<{
  onlyUnread: boolean;
  onChange: (onlyUnread: boolean) => void;
}>) {
  return (
    <div className="flex gap-1 p-0.5 rounded-md bg-muted/50 border border-subtle/60" role="group" aria-label="Filter notifications">
      <button
        type="button"
        className={cn(
          'flex-1 text-xs font-medium py-1.5 rounded transition-colors',
          !onlyUnread ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-secondary'
        )}
        onClick={() => onChange(false)}
      >
        All
      </button>
      <button
        type="button"
        className={cn(
          'flex-1 text-xs font-medium py-1.5 rounded transition-colors',
          onlyUnread ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-secondary'
        )}
        onClick={() => onChange(true)}
      >
        Unread
      </button>
    </div>
  );
}
