'use client';

import { Menu } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { UserMenu, type CurrentUser } from './UserMenu';
import { NotificationButton } from './NotificationButton';

export interface TopbarProps {
  user?: CurrentUser | null;
  unreadNotifications?: number;
  onMenuClick?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function Topbar({
  user,
  unreadNotifications = 0,
  onMenuClick,
  onLogout,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        'h-14 px-4 md:px-6 flex items-center justify-between',
        'bg-surface border-b border-subtle sticky top-0 z-30 shrink-0',
        className
      )}
    >
      {/* Left: hamburger (mobile) + wordmark (desktop) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-md text-muted hover:bg-muted hover:text-primary transition-colors"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <span className="hidden md:flex items-center gap-2">
          <span className="text-sm font-semibold text-primary font-primary">DevWeb Journal</span>
          <span className="text-xs text-muted bg-muted px-1.5 py-0.5 rounded font-medium border border-subtle">Editorial</span>
        </span>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-1 md:gap-2">
        <NotificationButton unreadCount={unreadNotifications} />
        {user && <UserMenu user={user} onLogout={onLogout} />}
      </div>
    </header>
  );
}
