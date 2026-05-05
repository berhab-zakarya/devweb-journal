'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/shared/components/ui';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authKeys } from '@/features/auth/queries/auth.keys';
import { AppError } from '@/shared/errors/app.error';
import { useDashboard } from '../hooks/useDashboard';
import { RoleDashboardContent } from './RoleDashboardContent';

export function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  useEffect(() => {
    if (!isError || !(error instanceof AppError) || !error.isUnauthorized) return;
    queryClient.removeQueries({ queryKey: authKeys.me() });
    router.replace('/login');
  }, [isError, error, queryClient, router]);

  if (isLoading) return <LoadingState rows={4} />;
  if (isError) {
    if (error instanceof AppError && error.isUnauthorized) {
      return <LoadingState rows={2} />;
    }
    return (
      <ErrorState
        message="Could not load dashboard data."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your activity" />
        <EmptyState
          icon={<LayoutDashboard className="w-6 h-6" />}
          title="Nothing to show yet"
          description="Your dashboard will populate as you use the system."
        />
      </div>
    );
  }

  const roles = user?.roles ?? [];
  const hasWorkflowSections =
    (data.requires_attention?.length ?? 0) +
      (data.pending?.length ?? 0) +
      (data.completed?.length ?? 0) >
    0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={data.role ? `Welcome back — ${data.role}` : 'Overview of your activity'}
      />

      <RoleDashboardContent data={data} userRoles={roles} />

      {!hasWorkflowSections && (
        <EmptyState
          icon={<LayoutDashboard className="w-6 h-6" />}
          title="Nothing to show yet"
          description="Your dashboard will populate as you use the system."
          className="mt-6"
        />
      )}
    </div>
  );
}
