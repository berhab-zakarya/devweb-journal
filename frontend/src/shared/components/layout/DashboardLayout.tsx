'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogoutMutation } from '@/features/auth/mutations/auth.mutations';
import { useNotificationsUnreadCount } from '@/features/notifications/hooks/useNotificationsUnreadCount';
import { AppError } from '@/shared/errors/app.error';
import { LoadingState } from '@/shared/components/ui';
import { AppShell } from './AppShell';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const logout = useLogoutMutation();
  const { data: unreadCount = 0 } = useNotificationsUnreadCount(!!user);

  useEffect(() => {
    if (isLoading) return;
    if (isError && error instanceof AppError && error.isUnauthorized) {
      router.replace('/login');
    }
  }, [isLoading, isError, error, router]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <LoadingState rows={3} />
      </div>
    );
  }

  if (isError && error instanceof AppError && error.isUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <LoadingState rows={2} />
      </div>
    );
  }

  return (
    <AppShell
      user={user ?? null}
      unreadNotifications={unreadCount}
      onLogout={() => logout.mutate()}
    >
      {children}
    </AppShell>
  );
}
