'use client';

import type { Notification } from '../types/Notification.types';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';

export function NotificationDropdownList({
  items,
  loading,
  onlyUnread,
  onFilterChange,
  onItemClick,
}: Readonly<{
  items: Notification[];
  loading: boolean;
  onlyUnread: boolean;
  onFilterChange: (v: boolean) => void;
  onItemClick: (n: Notification) => void;
}>) {
  return (
    <div className="max-h-80 flex flex-col">
      <div className="px-3 py-2 border-b border-subtle space-y-2">
        <NotificationFilters onlyUnread={onlyUnread} onChange={onFilterChange} />
      </div>
      <div className="overflow-y-auto flex-1 min-h-0">
        {loading && <p className="px-3 py-4 text-sm text-muted text-center">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted text-center">No notifications.</p>
        )}
        {!loading &&
          items.map((n) => <NotificationItem key={n.id} notification={n} onSelect={onItemClick} />)}
      </div>
    </div>
  );
}
