'use client';

import Link from 'next/link';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  LoadingState,
  ErrorState,
  Button,
  AssignmentStatusBadge,
} from '@/shared/components/ui';
import { useAssignment } from '../hooks/useAssignment';
import { useRespondMutation } from '../mutations/assignments.mutations';

export function AssignmentDetailsPage({ id }: { id: number }) {
  const { data: assignment, isLoading, isError, refetch } = useAssignment(id);
  const respond = useRespondMutation(id);

  if (isLoading) return <LoadingState rows={3} />;
  if (isError) return <ErrorState message="Could not load assignment." onRetry={() => refetch()} />;

  const isPending = assignment!.response === null;

  return (
    <div>
      <div className="mb-4">
        <Link href="/assignments" className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to Assignments
        </Link>
      </div>

      <PageHeader title="Assignment Details" />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-primary">Assignment #{assignment!.id}</h2>
            <AssignmentStatusBadge status={assignment!.status} />
          </CardHeader>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {assignment!.article && (
              <div className="sm:col-span-2">
                <dt className="text-muted font-medium">Article</dt>
                <dd className="mt-1">
                  <Link
                    href={`/articles/${assignment!.article_id}`}
                    className="text-brand-600 hover:underline font-medium"
                  >
                    {assignment!.article.title}
                  </Link>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted font-medium">Due Date</dt>
              <dd className="mt-1 text-primary">{new Date(assignment!.due_date).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-muted font-medium">Status</dt>
              <dd className="mt-1"><AssignmentStatusBadge status={assignment!.status} /></dd>
            </div>
          </dl>

          {isPending && (
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="primary"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                loading={respond.isPending}
                onClick={() => respond.mutate('accepted')}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                leftIcon={<XCircle className="w-4 h-4" />}
                loading={respond.isPending}
                onClick={() => respond.mutate('decline')}
              >
                Decline
              </Button>
            </div>
          )}

          {assignment!.response === 'accepted' && assignment!.status !== 'complete' && (
            <div className="mt-6">
              <Link
                href={`/assignments/${id}/review`}
                className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
              >
                Submit Review
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
