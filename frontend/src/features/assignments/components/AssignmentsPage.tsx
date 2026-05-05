'use client';

import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { PageHeader, Card, EmptyState, LoadingState, ErrorState, AssignmentStatusBadge } from '@/shared/components/ui';
import { useMyAssignments } from '../hooks/useMyAssignments';

export function AssignmentsPage() {
  const assignmentsQuery = useMyAssignments();
  const assignments = assignmentsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="My Assignments"
        description="Articles assigned to you for peer review"
      />

      <Card padding="none">
        {assignmentsQuery.isLoading && <LoadingState variant="list" rows={4} />}

        {assignmentsQuery.isError && (
          <ErrorState message="Could not load assignments." onRetry={() => assignmentsQuery.refetch()} className="py-12" />
        )}

        {!assignmentsQuery.isLoading && !assignmentsQuery.isError && assignments.length === 0 && (
          <EmptyState
            icon={<ClipboardCheck className="w-6 h-6" />}
            title="No assignments"
            description="You have no pending review assignments."
            className="py-16"
          />
        )}

        {!assignmentsQuery.isLoading && !assignmentsQuery.isError && assignments.length > 0 && (
          <ul className="divide-y divide-subtle">
            {assignments.map((a) => (
              <li key={a.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                <div className="min-w-0 flex-1">
                  {a.article ? (
                    <p className="text-sm font-medium text-primary truncate">{a.article.title}</p>
                  ) : (
                    <p className="text-sm font-medium text-primary">Assignment #{a.id}</p>
                  )}
                  <p className="text-xs text-muted mt-0.5">
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <AssignmentStatusBadge status={a.status} />
                  <Link
                    href={`/assignments/${a.id}`}
                    className="text-sm text-brand-600 hover:underline font-medium"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
