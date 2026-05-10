'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  AlertCircle,
  Clock,
  CheckCircle2,
  BookOpen,
  FolderTree,
  LayoutGrid,
  Users,
  FilePlus,
} from 'lucide-react';
import { EmptyState, LoadingState, ErrorState, RoleBadge } from '@/shared/components/ui';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authKeys } from '@/features/auth/queries/auth.keys';
import { AppError } from '@/shared/errors/app.error';
import { getPrimaryRole, getDashboardTitle, getDashboardDescription, getVisibleQuickActions, filterWorkflowItemsByRole } from '../utils/roleHelpers';
import { useDashboard } from '../hooks/useDashboard';
import { RoleDashboardContent } from './RoleDashboardContent';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import type { DashboardRole } from '../utils/roleHelpers';

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-4 h-4" aria-hidden />,
  FolderTree: <FolderTree className="w-4 h-4" aria-hidden />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" aria-hidden />,
  BookOpen: <BookOpen className="w-4 h-4" aria-hidden />,
  FilePlus: <FilePlus className="w-4 h-4" aria-hidden />,
};

const roleAccentColors: Record<DashboardRole, string> = {
  admin:    'from-purple-50 to-white border-purple-200/60',
  editor:   'from-blue-50 to-white border-blue-200/60',
  reviewer: 'from-teal-50 to-white border-teal-200/60',
  author:   'from-orange-50 to-white border-orange-200/60',
  reader:   'from-slate-50 to-white border-slate-200/60',
};

const roleIconColors: Record<DashboardRole, string> = {
  admin:    'bg-purple-100 text-purple-700',
  editor:   'bg-blue-100 text-brand-700',
  reviewer: 'bg-teal-100 text-teal-700',
  author:   'bg-orange-100 text-orange-700',
  reader:   'bg-slate-100 text-slate-600',
};

const workspaceLabels: Record<DashboardRole, string> = {
  admin:    'Platform Overview',
  editor:   'Editorial Workspace',
  reviewer: 'Review Assignments',
  author:   'Submission Workspace',
  reader:   'Journal Access',
};

function DashboardHero({
  primaryRole,
  title,
  description,
  userRoles,
  attentionCount,
  pendingCount,
  completedCount,
}: {
  primaryRole: DashboardRole;
  title: string;
  description: string;
  userRoles: string[];
  attentionCount: number;
  pendingCount: number;
  completedCount: number;
}) {
  const accent = roleAccentColors[primaryRole];
  const iconColor = roleIconColors[primaryRole];
  const workspace = workspaceLabels[primaryRole];
  const quickActions = getVisibleQuickActions(primaryRole, userRoles).slice(0, 4);

  return (
    <div
      className={cn(
        'bg-linear-to-br border rounded-xl p-6 md:p-8 mb-8',
        accent
      )}
      style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)' }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: identity + summary */}
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              iconColor
            )}
          >
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-bold text-primary">{title}</h1>
              <RoleBadge role={primaryRole} />
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-lg">{description}</p>
            <p className="text-xs text-muted mt-1 font-medium uppercase tracking-wide">{workspace}</p>
          </div>
        </div>

        {/* Right: mini stats */}
        {(attentionCount + pendingCount + completedCount) > 0 && (
          <div className="flex items-center gap-4 shrink-0 flex-wrap">
            {attentionCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                <span className="font-semibold text-primary">{attentionCount}</span>
                <span className="text-muted">need attention</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="font-semibold text-primary">{pendingCount}</span>
                <span className="text-muted">pending</span>
              </div>
            )}
            {completedCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span className="font-semibold text-primary">{completedCount}</span>
                <span className="text-muted">completed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/60">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-md bg-surface/80 border border-subtle text-secondary hover:bg-surface hover:text-primary hover:border-strong transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {iconMap[action.icon]}
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <EmptyState
          icon={<LayoutDashboard className="w-6 h-6" />}
          title="Nothing to show yet"
          description="Your dashboard will populate as you use the system."
        />
      </div>
    );
  }

  const roles = user?.roles ?? [];
  const primaryRole = getPrimaryRole(roles);
  const dashboardTitle = getDashboardTitle(primaryRole);
  const dashboardDescription = getDashboardDescription(primaryRole);

  const filteredAttention = filterWorkflowItemsByRole(data.requires_attention ?? [], primaryRole, roles);
  const filteredPending = filterWorkflowItemsByRole(data.pending ?? [], primaryRole, roles);
  const filteredCompleted = filterWorkflowItemsByRole(data.completed ?? [], primaryRole, roles);

  const hasWorkflowSections =
    filteredAttention.length > 0 ||
    filteredPending.length > 0 ||
    filteredCompleted.length > 0;

  return (
    <div className="space-y-0">
      <DashboardHero
        primaryRole={primaryRole}
        title={dashboardTitle}
        description={dashboardDescription}
        userRoles={roles}
        attentionCount={filteredAttention.reduce((sum, i) => sum + i.count, 0)}
        pendingCount={filteredPending.reduce((sum, i) => sum + i.count, 0)}
        completedCount={filteredCompleted.reduce((sum, i) => sum + i.count, 0)}
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
