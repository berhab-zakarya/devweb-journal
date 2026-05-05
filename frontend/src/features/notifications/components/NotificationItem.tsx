'use client';

import { cn } from '@/shared/utils/cn';
import type { Notification } from '../types/Notification.types';

export function NotificationItem({
  notification,
  onSelect,
}: Readonly<{
  notification: Notification;
  onSelect: (n: Notification) => void;
}>) {
  const unread = !notification.read_at;
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'w-full text-left px-3 py-2.5 border-b border-subtle/60 last:border-0 hover:bg-muted/60 transition-colors',
        unread && 'bg-brand-50/40'
      )}
      onClick={() => onSelect(notification)}
    >
      <p className="text-sm font-medium text-primary line-clamp-1">{notification.title}</p>
      <p className="text-xs text-muted line-clamp-2 mt-0.5">{notification.body}</p>
    </button>
  );
}
