'use client';

import type { DashboardSummary } from '../types/Dashboard.types';
import { getPrimaryRole, filterWorkflowItemsByRole } from '../utils/roleHelpers';
import { CompletedWorkSection } from './CompletedWorkSection';
import { PendingWorkSection } from './PendingWorkSection';
import { RequiresAttentionSection } from './RequiresAttentionSection';

export function RoleDashboardContent({
  data,
  userRoles,
}: Readonly<{
  data: DashboardSummary;
  userRoles: string[];
}>) {
  const primaryRole = getPrimaryRole(userRoles);
  const filteredAttention = filterWorkflowItemsByRole(data.requires_attention ?? [], primaryRole, userRoles);
  const filteredPending = filterWorkflowItemsByRole(data.pending ?? [], primaryRole, userRoles);
  const filteredCompleted = filterWorkflowItemsByRole(data.completed ?? [], primaryRole, userRoles);

  return (
    <div className="space-y-8">
      <RequiresAttentionSection items={filteredAttention} />
      <PendingWorkSection items={filteredPending} />
      <CompletedWorkSection items={filteredCompleted} />
    </div>
  );
}
