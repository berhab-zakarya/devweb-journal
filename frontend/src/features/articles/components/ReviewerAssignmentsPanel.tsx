'use client';

import { Trash2 } from 'lucide-react';
import { LoadingState, AssignmentStatusBadge } from '@/shared/components/ui';
import type { ArticleAssignment } from '../types/Article.types';

export function ReviewerAssignmentsPanel({
  assignments,
  loading,
  onRemove,
  canManage = true,
  removePendingId,
}: Readonly<{
  assignments: ArticleAssignment[];
  loading: boolean;
  onRemove: (assignmentId: number) => void;
  canManage?: boolean;
  removePendingId?: number | null;
}>) {
  if (loading) return <LoadingState variant="list" rows={2} />;
  if (assignments.length === 0) return null;

  return (
    <ul className="mb-4 divide-y divide-subtle">
      {assignments.map((a) => (
        <li key={a.id} className="py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{a.reviewer?.name ?? `Reviewer #${a.reviewer_id}`}</p>
            {a.due_date && (
              <p className="text-xs text-muted">Due: {new Date(a.due_date).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <AssignmentStatusBadge status={a.status} />
            {canManage && (
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                disabled={removePendingId === a.id}
                className="p-1.5 rounded text-muted hover:text-danger hover:bg-red-50 transition-colors"
                aria-label="Remove assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
