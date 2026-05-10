'use client';

import Link from 'next/link';
import { ChevronLeft, CheckCircle, XCircle, Star, FileText } from 'lucide-react';
import { DownloadPdfButton } from '@/features/articles/components/DownloadPdfButton';
import {
  PageHeader,
  Card,
  CardHeader,
  LoadingState,
  ErrorState,
  Button,
  AssignmentStatusBadge,
} from '@/shared/components/ui';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import {
  isEditor,
  isAdmin,
  canRespondToAssignment,
  canSubmitAssignmentReview,
  canViewAssignmentReview,
  canDownloadAssignedManuscript,
} from '@/shared/auth/permissions';
import { useAssignment } from '../hooks/useAssignment';
import { useRespondMutation } from '../mutations/assignments.mutations';

export function AssignmentDetailsPage({ id }: Readonly<{ id: number }>) {
  const { data: currentUser } = useCurrentUser();
  const { data: assignment, isLoading, isError, refetch } = useAssignment(id);
  const respond = useRespondMutation(id);

  if (isLoading) return <LoadingState rows={3} />;
  if (isError)   return <ErrorState message="Could not load assignment." onRetry={() => refetch()} />;

  const a = assignment!;

  const canRespond    = canRespondToAssignment(currentUser, a);
  const canSubmit     = canSubmitAssignmentReview(currentUser, a);
  const canViewReview = canViewAssignmentReview(currentUser, a);
  const canDownload   = canDownloadAssignedManuscript(currentUser, a);
  const editorView    = (isEditor(currentUser) || isAdmin(currentUser)) && !canRespond && !canSubmit;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Assignments
        </Link>
      </div>

      <PageHeader
        title="Assignment Details"
        description={a.article?.title ?? `Assignment #${a.id}`}
      />

      <div className="space-y-6 w-full min-w-0">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-primary">Assignment #{a.id}</h2>
            <AssignmentStatusBadge status={a.status} />
          </CardHeader>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {a.article && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Article</dt>
                <dd>
                  <Link
                    href={`/articles/${a.article_id}`}
                    className="text-brand-600 hover:underline font-medium"
                  >
                    {a.article.title}
                  </Link>
                  {a.article.abstract && (
                    <p className="mt-1 text-muted text-sm line-clamp-3">
                      {a.article.abstract}
                    </p>
                  )}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Due Date</dt>
              <dd className="text-primary">
                {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Status</dt>
              <dd><AssignmentStatusBadge status={a.status} /></dd>
            </div>
          </dl>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-start gap-3 pt-5 border-t border-subtle">
            {canDownload && a.article_id && (
              <DownloadPdfButton
                articleId={a.article_id}
                articleTitle={a.article?.title}
                label="Download Manuscript PDF"
              />
            )}

            {canRespond && (
              <>
                <Button
                  variant="primary"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  loading={respond.isPending}
                  onClick={() => respond.mutate('accepted')}
                >
                  Accept Assignment
                </Button>
                <Button
                  variant="destructive"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  loading={respond.isPending}
                  onClick={() => respond.mutate('decline')}
                >
                  Decline
                </Button>
              </>
            )}

            {canSubmit && (
              <Link
                href={`/assignments/${id}/review`}
                className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
              >
                <Star className="w-4 h-4" />
                Submit Review
              </Link>
            )}

            {canViewReview && !canSubmit && (
              <Link
                href={`/assignments/${id}/review`}
                className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded border border-strong text-secondary hover:bg-muted font-medium transition-colors"
              >
                View Submitted Review
              </Link>
            )}

            {a.status === 'decline' && !editorView && (
              <p className="text-sm text-muted italic">You declined this assignment.</p>
            )}

            {/* Editor/admin: link to full article editorial workflow */}
            {editorView && a.article_id && (
              <Link
                href={`/articles/${a.article_id}`}
                className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded border border-strong text-secondary hover:bg-muted font-medium transition-colors"
              >
                <FileText className="w-4 h-4" />
                Open Article
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
