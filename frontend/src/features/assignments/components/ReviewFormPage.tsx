'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, AlertCircle, XCircle, FileText, ShieldX } from 'lucide-react';
import { PageHeader, Card, LoadingState, ErrorState, Button } from '@/shared/components/ui';
import { DownloadPdfButton } from '@/features/articles/components/DownloadPdfButton';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { assignmentReviewQueryOptions } from '../queries/assignments.queries';
import { useSubmitReviewMutation, useRespondMutation } from '../mutations/assignments.mutations';
import { useAssignment } from '../hooks/useAssignment';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { isAssignmentOwner } from '@/shared/auth/permissions';
import type { Recommendation } from '../types/Assignment.types';

const RECOMMENDATIONS: Recommendation[] = ['accept', 'minor_revision', 'major_revision', 'reject'];

function scoreField() {
  return z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v)) ? null : Number(v)),
    z.number({ invalid_type_error: 'Enter a number between 0 and 10' })
      .int('Must be a whole number')
      .min(0, 'Minimum is 0')
      .max(10, 'Maximum is 10')
      .nullable(),
  );
}

const schema = z
  .object({
    is_draft:          z.boolean().default(false),
    originality_score: scoreField(),
    methodology_score: scoreField(),
    clarity_score:     scoreField(),
    overall_score:     scoreField(),
    recommendation:    z.string(),
    comments:          z.string(),
  })
  .superRefine((d, ctx) => {
    if (d.is_draft) return;

    const req = (path: string, val: unknown) => {
      if (val === null || val === undefined || val === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: 'This field is required' });
      }
    };

    req('originality_score', d.originality_score);
    req('methodology_score', d.methodology_score);
    req('clarity_score',     d.clarity_score);
    req('overall_score',     d.overall_score);

    if (!d.recommendation || !RECOMMENDATIONS.includes(d.recommendation as Recommendation)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['recommendation'], message: 'Select a recommendation' });
    }

    if (!d.comments?.trim() || d.comments.trim().length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['comments'], message: 'Comments must be at least 10 characters' });
    }
  });

type FormData = z.infer<typeof schema>;

const RECOMMENDATION_LABELS: Record<string, string> = {
  accept:         'Accept',
  minor_revision: 'Minor Revision',
  major_revision: 'Major Revision',
  reject:         'Reject',
};

function BackLink({ assignmentId }: { assignmentId: number }) {
  return (
    <div className="mb-4">
      <Link
        href={`/assignments/${assignmentId}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Assignment
      </Link>
    </div>
  );
}

export function ReviewFormPage({ assignmentId }: Readonly<{ assignmentId: number }>) {
  const router = useRouter();
  const [generalError, setGeneralError] = useState('');

  const { data: currentUser } = useCurrentUser();

  const {
    data: assignment,
    isLoading: assignmentLoading,
    isError: assignmentError,
    refetch: refetchAssignment,
  } = useAssignment(assignmentId);

  const existingReviewQuery = useQuery({ ...assignmentReviewQueryOptions(assignmentId), retry: false });
  const submitReview = useSubmitReviewMutation(assignmentId);
  const respond      = useRespondMutation(assignmentId);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_draft:          false,
      originality_score: null,
      methodology_score: null,
      clarity_score:     null,
      overall_score:     null,
      recommendation:    '',
      comments:          '',
    },
  });

  const existingReview = existingReviewQuery.data;

  useEffect(() => {
    if (existingReview?.is_draft) {
      reset({
        is_draft:          true,
        originality_score: existingReview.originality_score,
        methodology_score: existingReview.methodology_score,
        clarity_score:     existingReview.clarity_score,
        overall_score:     existingReview.overall_score,
        recommendation:    existingReview.recommendation ?? '',
        comments:          existingReview.comments ?? '',
      });
    }
  }, [existingReview, reset]);

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    submitReview.mutate(
      {
        is_draft:          data.is_draft,
        originality_score: data.originality_score,
        methodology_score: data.methodology_score,
        clarity_score:     data.clarity_score,
        overall_score:     data.overall_score,
        recommendation:    (data.recommendation as Recommendation) || null,
        comments:          data.comments || null,
      },
      {
        onSuccess: () => router.push(`/assignments/${assignmentId}`),
        onError: (error) => {
          const fieldErrors = getLaravelFieldErrors(error);
          if (Object.keys(fieldErrors).length > 0) {
            for (const [field, message] of Object.entries(fieldErrors)) {
              setError(field as keyof FormData, { message: String(message) });
            }
          } else {
            setGeneralError(getErrorMessage(error));
          }
        },
      },
    );
  };

  // ── Load assignment first ────────────────────────────────────────────────
  if (assignmentLoading) return <LoadingState rows={3} />;

  if (assignmentError) {
    return (
      <ErrorState
        title="Assignment not found"
        message="This assignment could not be loaded."
        onRetry={() => refetchAssignment()}
      />
    );
  }

  const articleTitle = assignment?.article?.title ?? `Assignment #${assignmentId}`;

  // ── Guard: role — only the assigned reviewer may submit or view this form ─
  if (assignment && !isAssignmentOwner(currentUser, assignment)) {
    return (
      <div>
        <BackLink assignmentId={assignmentId} />
        <PageHeader title="Submit Review" description={articleTitle} />
        <Card>
          <div className="flex flex-col items-center text-center gap-4 py-10 px-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <ShieldX className="w-6 h-6 text-danger" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-primary mb-1">Not Authorized</h2>
              <p className="text-sm text-muted max-w-sm">
                Only the reviewer assigned to this article can submit or view this review.
              </p>
            </div>
            <Link href="/assignments" className="text-sm text-brand-600 hover:underline font-medium">
              Back to Assignments
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── Guard: pending ───────────────────────────────────────────────────────
  if (assignment?.status === 'pending') {
    return (
      <div>
        <BackLink assignmentId={assignmentId} />
        <PageHeader title="Submit Review" description={articleTitle} />
        <div className="w-full min-w-0">
          <Card>
            <div className="flex flex-col items-center text-center gap-4 py-8 px-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-primary mb-1">
                  Assignment not yet accepted
                </h2>
                <p className="text-sm text-muted max-w-sm">
                  You must accept this assignment before you can submit a review. Accept it to
                  confirm your availability and unlock the review form.
                </p>
              </div>
              <Button
                variant="primary"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                loading={respond.isPending}
                onClick={() => respond.mutate('accepted')}
              >
                Accept Assignment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Guard: declined ──────────────────────────────────────────────────────
  if (assignment?.status === 'decline') {
    return (
      <div>
        <BackLink assignmentId={assignmentId} />
        <PageHeader title="Submit Review" description={articleTitle} />
        <div className="w-full min-w-0">
          <Card>
            <div className="flex flex-col items-center text-center gap-4 py-8 px-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-danger" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-primary mb-1">Assignment Declined</h2>
                <p className="text-sm text-muted max-w-sm">
                  You declined this assignment. Review submission is not available.
                </p>
              </div>
              <Link href="/assignments" className="text-sm text-brand-600 hover:underline font-medium">
                Back to Assignments
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Load existing review ─────────────────────────────────────────────────
  if (existingReviewQuery.isLoading) return <LoadingState rows={3} />;

  const isSubmitted = existingReview && !existingReview.is_draft;

  return (
    <div>
      <BackLink assignmentId={assignmentId} />

      <PageHeader
        title={isSubmitted ? 'Review Submitted' : 'Submit Review'}
        description={articleTitle}
      />

      <div className="w-full min-w-0 space-y-4 max-w-3xl">
        {/* Article summary card */}
        {assignment?.article_id && (
          <Card>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded bg-brand-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-brand-600" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-0.5">Manuscript</p>
                <p className="text-sm font-medium text-primary truncate">{articleTitle}</p>
                {assignment.due_date && (
                  <p className="text-xs text-muted mt-1">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-3">
                  <DownloadPdfButton
                    articleId={assignment.article_id}
                    articleTitle={assignment.article?.title}
                    label="Download Manuscript PDF"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {isSubmitted ? (
          /* ── Read-only view of a submitted review ── */
          <Card>
            <p className="text-sm text-muted mb-6">Your review has been submitted and cannot be edited.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {(
                [
                  ['Originality', existingReview.originality_score],
                  ['Methodology', existingReview.methodology_score],
                  ['Clarity',     existingReview.clarity_score],
                  ['Overall',     existingReview.overall_score],
                ] as [string, number | null][]
              ).map(([label, score]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wide">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold text-primary">
                    {score ?? '—'}
                    <span className="text-sm font-normal text-muted">/10</span>
                  </dd>
                </div>
              ))}
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-muted">Recommendation</dt>
                <dd className="mt-1 text-primary">
                  {existingReview.recommendation
                    ? (RECOMMENDATION_LABELS[existingReview.recommendation] ?? existingReview.recommendation)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Comments</dt>
                <dd className="mt-1 text-secondary whitespace-pre-wrap">{existingReview.comments}</dd>
              </div>
            </dl>
          </Card>
        ) : (
          /* ── Editable form (new or draft) ── */
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <ReviewForm
                register={register}
                errors={errors}
                generalError={generalError}
                draftHint={!!existingReview?.is_draft}
                isSubmitting={isSubmitting}
                submitPending={submitReview.isPending}
              />
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
