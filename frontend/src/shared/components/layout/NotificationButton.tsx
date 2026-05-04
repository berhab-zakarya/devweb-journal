'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { notificationsListQueryOptions } from '@/features/notifications/queries/notifications.queries';
import { useMarkReadMutation } from '@/features/notifications/mutations/notifications.mutations';
import type { Notification } from '@/features/notifications/types/Notification.types';

export interface NotificationButtonProps {
  unreadCount?: number;
  className?: string;
}

export function NotificationButton({ unreadCount = 0, className }: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const markRead = useMarkReadMutation();

  const { data: listData, isFetching } = useQuery({
    ...notificationsListQueryOptions({ page: 1 }),
    enabled: open,
  });

  const recent = listData?.data?.data?.slice(0, 8) ?? [];

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!rootRef.current?.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        className={cn(
          'relative p-2 rounded-md text-muted hover:bg-muted hover:text-primary transition-colors duration-150',
          open && 'bg-muted text-primary'
        )}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[0.5rem] h-2 px-0.5 rounded-full bg-danger text-[10px] leading-none text-white flex items-center justify-center font-medium"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-subtle bg-surface shadow-panel z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-subtle bg-muted/40">
            <span className="text-sm font-semibold text-primary">Notifications</span>
            <Link
              href="/notifications"
              className="text-xs font-medium text-brand-600 hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isFetching && (
              <p className="px-3 py-4 text-sm text-muted text-center">Loading…</p>
            )}
            {!isFetching && recent.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted text-center">No notifications yet.</p>
            )}
            {!isFetching &&
              recent.map((n: Notification) => (
                <button
                  key={n.id}
                  type="button"
                  role="menuitem"
                  className={cn(
                    'w-full text-left px-3 py-2.5 border-b border-subtle/60 last:border-0 hover:bg-muted/60 transition-colors',
                    !n.read_at && 'bg-brand-50/40'
                  )}
                  onClick={() => {
                    if (!n.read_at) {
                      markRead.mutate(n.id);
                    }
                    setOpen(false);
                  }}
                >
                  <p className="text-sm font-medium text-primary line-clamp-1">{n.title}</p>
                  <p className="text-xs text-muted line-clamp-2 mt-0.5">{n.body}</p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
