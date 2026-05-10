'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, CheckCircle, XCircle, Star, FileText } from 'lucide-react';
import { DownloadPdfButton } from '@/features/articles/components/DownloadPdfButton';
import {
  PageHeader,
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  AssignmentStatusBadge,
  SearchInput,
  Button,
  TableWrapper,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  TableFilterBar,
} from '@/shared/components/ui';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import {
  isEditor,
  isAdmin,
  isReviewer,
  canRespondToAssignment,
  canSubmitAssignmentReview,
  canViewAssignmentReview,
  canDownloadAssignedManuscript,
} from '@/shared/auth/permissions';
import { useMyAssignments } from '../hooks/useMyAssignments';
import { useRespondMutation } from '../mutations/assignments.mutations';
import type { Assignment } from '../types/Assignment.types';
import type { User } from '@/features/auth/types/Auth.types';

// ─── Per-row action cell ─────────────────────────────────────────────────────

function ReviewerActions({ assignment }: { assignment: Assignment }) {
  const { data: currentUser } = useCurrentUser();
  const respond = useRespondMutation(assignment.id);

  const canRespond  = canRespondToAssignment(currentUser, assignment);
  const canSubmit   = canSubmitAssignmentReview(currentUser, assignment);
  const canViewReview = canViewAssignmentReview(currentUser, assignment);
  const canDownload = canDownloadAssignedManuscript(currentUser, assignment);

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {canDownload && assignment.article_id && (
        <DownloadPdfButton
          articleId={assignment.article_id}
          articleTitle={assignment.article?.title}
        />
      )}

      {canRespond && (
        <>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            loading={respond.isPending}
            onClick={() => respond.mutate('accepted')}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
            loading={respond.isPending}
            onClick={() => respond.mutate('decline')}
          >
            Decline
          </Button>
        </>
      )}

      {canSubmit && (
        <Link
          href={`/assignments/${assignment.id}/review`}
          className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
        >
          <Star className="w-3.5 h-3.5" />
          Submit Review
        </Link>
      )}

      {canViewReview && !canSubmit && (
        <Link
          href={`/assignments/${assignment.id}/review`}
          className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded border border-strong text-secondary hover:bg-muted font-medium transition-colors"
        >
          View Review
        </Link>
      )}

      <Link
        href={`/assignments/${assignment.id}`}
        className="inline-flex items-center h-9 px-3 text-sm rounded border border-strong text-secondary hover:bg-muted font-medium transition-colors"
      >
        Details
      </Link>
    </div>
  );
}

function EditorActions({ assignment }: { assignment: Assignment }) {
  const { data: currentUser } = useCurrentUser();
  const canDownload = canDownloadAssignedManuscript(currentUser, assignment);

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {canDownload && assignment.article_id && (
        <DownloadPdfButton
          articleId={assignment.article_id}
          articleTitle={assignment.article?.title}
        />
      )}
      {assignment.article_id && (
        <Link
          href={`/articles/${assignment.article_id}`}
          className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded border border-strong text-secondary hover:bg-muted font-medium transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          View Article
        </Link>
      )}
      <Link
        href={`/assignments/${assignment.id}`}
        className="inline-flex items-center h-9 px-3 text-sm rounded border border-strong text-secondary hover:bg-muted font-medium transition-colors"
      >
        Details
      </Link>
    </div>
  );
}

function AssignmentActions({
  assignment,
  currentUser,
}: {
  assignment: Assignment;
  currentUser: User | null | undefined;
}) {
  if (isReviewer(currentUser) && !isEditor(currentUser) && !isAdmin(currentUser)) {
    return <ReviewerActions assignment={assignment} />;
  }
  if (isEditor(currentUser) || isAdmin(currentUser)) {
    return <EditorActions assignment={assignment} />;
  }
  return (
    <Link
      href={`/assignments/${assignment.id}`}
      className="inline-flex items-center h-9 px-3 text-sm rounded border border-strong text-secondary hover:bg-muted font-medium transition-colors"
    >
      Details
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function AssignmentsPage() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: currentUser } = useCurrentUser();
  const assignmentsQuery = useMyAssignments();
  const assignments = assignmentsQuery.data ?? [];

  const isEditorOrAdmin = isEditor(currentUser) || isAdmin(currentUser);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        !search ||
        a.article?.title?.toLowerCase().includes(search.toLowerCase()) ||
        String(a.id).includes(search);
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  const pendingCount  = assignments.filter((a) => a.status === 'pending').length;
  const acceptedCount = assignments.filter((a) => a.status === 'accepted').length;
  const completeCount = assignments.filter((a) => a.status === 'complete').length;

  const pageTitle       = isEditorOrAdmin ? 'Review Assignments' : 'My Assignments';
  const pageDescription = isEditorOrAdmin
    ? 'Track reviewer assignments and manage editorial review progress.'
    : 'Review articles assigned to you and submit your evaluations.';

  const emptyDescription = isEditorOrAdmin
    ? 'Reviewer assignments will appear here once articles enter the review stage.'
    : 'Articles assigned to you for peer review will appear here.';

  return (
    <div>
      <PageHeader title={pageTitle} description={pageDescription} />

      {assignments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface border border-subtle rounded-xl p-4 stat-card-attention">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Pending</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{pendingCount}</p>
          </div>
          <div className="bg-surface border border-subtle rounded-xl p-4 stat-card-pending">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">In Progress</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{acceptedCount}</p>
          </div>
          <div className="bg-surface border border-subtle rounded-xl p-4 col-span-2 sm:col-span-1 stat-card-completed">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Completed</p>
            <p className="text-2xl font-bold text-secondary tabular-nums">{completeCount}</p>
          </div>
        </div>
      )}

      <Card padding="none">
        <TableFilterBar>
          <SearchInput
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search by article title…"
            className="flex-1 min-w-[180px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 pr-8 rounded-md border border-subtle text-sm text-secondary bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="complete">Completed</option>
            <option value="decline">Declined</option>
          </select>
        </TableFilterBar>

        {assignmentsQuery.isLoading && <LoadingState variant="table" rows={4} />}

        {assignmentsQuery.isError && (
          <ErrorState
            message="Could not load assignments."
            onRetry={() => assignmentsQuery.refetch()}
            className="py-12"
          />
        )}

        {!assignmentsQuery.isLoading && !assignmentsQuery.isError && filtered.length === 0 && (
          <EmptyState
            icon={<ClipboardCheck className="w-6 h-6" />}
            title={search || statusFilter ? 'No matching assignments' : 'No assignments yet'}
            description={
              search || statusFilter ? 'Try adjusting your search or filter.' : emptyDescription
            }
            className="py-16"
          />
        )}

        {!assignmentsQuery.isLoading && !assignmentsQuery.isError && filtered.length > 0 && (
          <TableWrapper>
            <TableHead>
              <Th>Article</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <TableBody>
              {filtered.map((a) => (
                <Tr key={a.id}>
                  <Td className="max-w-xs">
                    <p className="font-medium text-primary truncate">
                      {a.article?.title ?? `Assignment #${a.id}`}
                    </p>
                    {a.article?.abstract && (
                      <p className="text-xs text-muted mt-0.5 truncate max-w-sm">
                        {a.article.abstract}
                      </p>
                    )}
                  </Td>
                  <Td className="text-muted whitespace-nowrap text-sm">
                    {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                  </Td>
                  <Td>
                    <AssignmentStatusBadge status={a.status} />
                  </Td>
                  <Td align="right">
                    <AssignmentActions assignment={a} currentUser={currentUser} />
                  </Td>
                </Tr>
              ))}
            </TableBody>
          </TableWrapper>
        )}
      </Card>
    </div>
  );
}
