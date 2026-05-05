'use client';

import type { DashboardSummary } from '../types/Dashboard.types';
import { CompletedWorkSection } from './CompletedWorkSection';
import { PendingWorkSection } from './PendingWorkSection';
import { RequiresAttentionSection } from './RequiresAttentionSection';
import { RoleQuickActions } from './RoleQuickActions';
import { WorkflowStatusCards } from './WorkflowStatusCards';

export function RoleDashboardContent({
  data,
  userRoles,
}: Readonly<{
  data: DashboardSummary;
  userRoles: string[];
}>) {
  const hasAnyCounts =
    (data.requires_attention?.length ?? 0) > 0 ||
    (data.pending?.length ?? 0) > 0 ||
    (data.completed?.length ?? 0) > 0;

  return (
    <div>
      <RoleQuickActions summaryRole={data.role} userRoles={userRoles} />
      {hasAnyCounts && <WorkflowStatusCards data={data} />}
      <div className="space-y-8">
        <RequiresAttentionSection items={data.requires_attention ?? []} />
        <PendingWorkSection items={data.pending ?? []} />
        <CompletedWorkSection items={data.completed ?? []} />
      </div>
    </div>
  );
}
