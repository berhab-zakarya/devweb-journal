'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/shared/components/ui';
import { authKeys } from '@/features/auth/queries/auth.keys';
import { AppError } from '@/shared/errors/app.error';
import { useDashboard } from '../hooks/useDashboard';

export function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={data?.role ? `Welcome back — ${data.role}` : 'Overview of your activity'}
      />

      {!data || (
        !data.requires_attention?.length &&
        !data.pending?.length &&
        !data.completed?.length
      ) ? (
        <EmptyState
          icon={<LayoutDashboard className="w-6 h-6" />}
          title="Nothing to show yet"
          description="Your dashboard will populate as you use the system."
        />
      ) : (
        <div className="space-y-8">
          {data.requires_attention?.length > 0 && (
            <DashboardSection
              title="Requires Attention"
              items={data.requires_attention}
              highlight
            />
          )}
          {data.pending?.length > 0 && (
            <DashboardSection title="Pending" items={data.pending} />
          )}
          {data.completed?.length > 0 && (
            <DashboardSection title="Completed" items={data.completed} muted />
          )}
        </div>
      )}
    </div>
  );
}

interface DashboardItem {
  key: string;
  label: string;
  count: number;
  route: string;
}

function DashboardSection({
  title,
  items,
  highlight,
  muted,
}: {
  title: string;
  items: DashboardItem[];
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.route}
            className={`bg-surface border rounded-lg p-5 shadow-card hover:shadow-panel transition-shadow duration-150 block ${
              highlight ? 'border-l-4 border-l-warning border-subtle' : 'border-subtle'
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${muted ? 'text-muted' : 'text-secondary'}`}>
              {item.label}
            </p>
            <p className={`text-3xl font-bold ${muted ? 'text-secondary' : 'text-primary'}`}>
              {item.count}
            </p>
            <span className="text-xs text-brand-600 hover:underline mt-1 inline-block">
              View →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
