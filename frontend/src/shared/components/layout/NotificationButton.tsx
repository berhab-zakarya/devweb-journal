'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface NotificationButtonProps {
  unreadCount?: number;
  className?: string;
}

export function NotificationButton({ unreadCount = 0, className }: NotificationButtonProps) {
  return (
    <Link
      href="/notifications"
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      className={cn(
        'relative p-2 rounded-md text-muted hover:bg-muted hover:text-primary transition-colors duration-150',
        className
      )}
    >
      <Bell className="w-5 h-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
