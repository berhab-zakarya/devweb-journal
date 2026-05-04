'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import {
  PageHeader,
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  Button,
  Pagination,
} from '@/shared/components/ui';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkReadMutation, useMarkAllReadMutation } from '../mutations/notifications.mutations';
import { cn } from '@/shared/utils/cn';

export function NotificationsPage() {
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useNotifications({ only_unread: onlyUnread || undefined, page });
  const markRead = useMarkReadMutation();
  const markAllRead = useMarkAllReadMutation();

  const notifications = data?.data?.data ?? [];
  const total = data?.data?.meta?.total ?? 0;
  const lastPage = data?.data?.meta?.last_page ?? 1;
  const perPage = data?.data?.meta?.per_page ?? 15;
  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Your recent activity and alerts"
        action={
          hasUnread ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-subtle">
        {[
          { label: 'All', value: false },
          { label: 'Unread', value: true },
        ].map(({ label, value }) => (
          <button
            key={label}
            type="button"
            onClick={() => { setOnlyUnread(value); setPage(1); }}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              onlyUnread === value
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-muted hover:text-secondary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card padding="none">
        {isLoading && <LoadingState variant="list" rows={5} />}

        {isError && (
          <ErrorState message="Could not load notifications." onRetry={() => refetch()} className="py-12" />
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <EmptyState
            icon={<Bell className="w-6 h-6" />}
            title={onlyUnread ? 'No unread notifications' : 'No notifications'}
            description={onlyUnread ? 'You are all caught up.' : 'Activity alerts will appear here.'}
            className="py-16"
          />
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <ul className="divide-y divide-subtle">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  'px-5 py-4 flex items-start gap-4 transition-colors',
                  !n.read_at && 'bg-brand-50/40'
                )}
              >
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  <span
                    className={cn(
                      'block w-2 h-2 rounded-full',
                      n.read_at ? 'bg-transparent' : 'bg-brand-500'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', n.read_at ? 'text-secondary' : 'text-primary font-medium')}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-muted mt-0.5">{n.body}</p>
                  )}
                  <p className="text-xs text-muted mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>

                {!n.read_at && (
                  <button
                    type="button"
                    onClick={() => markRead.mutate(n.id)}
                    className="shrink-0 text-xs text-brand-600 hover:underline font-medium mt-0.5"
                    disabled={markRead.isPending}
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !isError && total > perPage && (
          <div className="px-4 py-3 border-t border-subtle">
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              from={(page - 1) * perPage + 1}
              to={Math.min(page * perPage, total)}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
