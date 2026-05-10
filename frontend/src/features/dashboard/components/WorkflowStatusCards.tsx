'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import type { DashboardSummary } from '../types/Dashboard.types';
import { getPrimaryRole, filterWorkflowItemsByRole } from '../utils/roleHelpers';
import { normalizeDashboardRoute } from '../utils/dashboardRoutes';

/** Compact summary strip reusing the same counters as the main sections. */
export function WorkflowStatusCards({ data }: Readonly<{ data: DashboardSummary }>) {
  const { data: user } = useCurrentUser();
  const userRoles = user?.roles ?? [];
  const primaryRole = getPrimaryRole(userRoles);
  
  const filteredAttention = filterWorkflowItemsByRole(data.requires_attention, primaryRole, userRoles);
  const filteredPending = filterWorkflowItemsByRole(data.pending, primaryRole, userRoles);
  const filteredCompleted = filterWorkflowItemsByRole(data.completed, primaryRole, userRoles);
  
  const all = [...filteredAttention, ...filteredPending, ...filteredCompleted].filter((i) => i.count > 0);
  if (!all.length) return null;
  const top = all.slice(0, 6);
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {top.map((item) => (
        <Link
          key={`wf-${item.key}`}
          href={normalizeDashboardRoute(item.route)}
          className="inline-flex items-center gap-2 rounded-full border border-subtle bg-muted/30 px-3 py-1.5 text-xs font-medium text-secondary hover:bg-muted/60 transition-colors"
        >
          <span className="text-primary font-semibold">{item.count}</span>
          <span className="truncate max-w-40">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
