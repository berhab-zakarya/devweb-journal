'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Users } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  LoadingState,
  ErrorState,
  FormField,
  Select,
  Textarea,
  Button,
} from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import {
  canAssignReviewers,
  canRecordEditorialDecision,
  canViewArticleDecision,
  canViewAuthorDecision,
  canViewPeerReviews,
  isAdmin,
} from '@/shared/auth/permissions';
import { useArticle } from '../hooks/useArticle';
import { useArticleAssignments } from '../hooks/useArticleAssignments';
import { useArticleDecision } from '../hooks/useArticleDecision';
import { useCreateDecisionMutation, useDeleteAssignmentMutation } from '../mutations/articles.mutations';
import type { DecisionType } from '../types/Article.types';
import { AdminFinalDecisionPanel } from './AdminFinalDecisionPanel';
import { ArticleReviewsPanel } from './ArticleReviewsPanel';
import { AssignReviewersForm } from './AssignReviewersForm';
import { ReviewerAssignmentsPanel } from './ReviewerAssignmentsPanel';

const decisionSchema = z.object({
  decision: z.enum(['accepted', 'rejected', 'revision_required'], {
    errorMap: () => ({ message: 'Please select a decision' }),
  }),
  comments: z.string().min(1, 'Comments are required'),
});
type DecisionFormData = z.infer<typeof decisionSchema>;

const DECISION_OPTIONS: { value: DecisionType; label: string }[] = [
  { value: 'accepted',          label: 'Accept' },
  { value: 'rejected',          label: 'Reject' },
  { value: 'revision_required', label: 'Request Revision' },
];

export function EditorialDecisionPage({ id }: Readonly<{ id: number }>) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  const articleQuery = useArticle(id);
  const assignmentsQuery = useArticleAssignments(id);
  const decisionQuery = useArticleDecision(id);
  const createDecision = useCreateDecisionMutation(id);
  const deleteAssignment = useDeleteAssignmentMutation(id);

  const [decisionError, setDecisionError] = useState('');

  const decisionForm = useForm<DecisionFormData>({ resolver: zodResolver(decisionSchema) });

  const onDecisionSubmit = (data: DecisionFormData) => {
    setDecisionError('');
    createDecision.mutate(data, {
      onSuccess: () => router.push(`/articles/${id}`),
      onError: (error) => {
        const fieldErrors = getLaravelFieldErrors(error);
        if (Object.keys(fieldErrors).length > 0) {
          for (const [field, message] of Object.entries(fieldErrors)) {
            decisionForm.setError(field as keyof DecisionFormData, { message });
          }
        } else {
          setDecisionError(getErrorMessage(error));
        }
      },
    });
  };

  if (articleQuery.isLoading) return <LoadingState rows={4} />;
  if (articleQuery.isError) return <ErrorState message="Could not load article." onRetry={() => articleQuery.refetch()} />;

  const article = articleQuery.data!;
  const assignments = assignmentsQuery.data ?? [];
  const decision = decisionQuery.data;

  const canViewPage = canViewArticleDecision(currentUser, article);
  const canAssign = canAssignReviewers(currentUser);
  const canRecordDecision = canRecordEditorialDecision(currentUser);
  const canSeeReviews = canViewPeerReviews(currentUser);
  const canSeeAuthorDecision = canViewAuthorDecision(currentUser, article);
  const adminView = isAdmin(currentUser);
  let decisionContent: React.ReactNode;

  if (decision?.latest) {
    decisionContent = (
      <div className="mt-2 space-y-2">
        <p className="text-sm text-muted">A decision has already been recorded for this article.</p>
        <p className="text-sm text-secondary">
          <span className="font-medium">Decision:</span>{' '}
          {DECISION_OPTIONS.find((o) => o.value === decision.latest?.decision)?.label ?? decision.latest?.decision}
        </p>
        {decision.latest?.comments && (
          <p className="text-sm text-secondary whitespace-pre-wrap">{decision.latest.comments}</p>
        )}
      </div>
    );
  } else if (canRecordDecision) {
    decisionContent = (
      <form onSubmit={decisionForm.handleSubmit(onDecisionSubmit)} noValidate className="space-y-4 mt-2">
        {decisionError && (
          <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
            {decisionError}
          </div>
        )}

        <FormField id="decision" label="Decision" required error={decisionForm.formState.errors.decision?.message}>
          <Select
            id="decision"
            error={!!decisionForm.formState.errors.decision}
            {...decisionForm.register('decision')}
          >
            <option value="">Select a decision…</option>
            {DECISION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField id="comments" label="Comments" required error={decisionForm.formState.errors.comments?.message}>
          <Textarea
            id="comments"
            rows={4}
            placeholder="Provide feedback and reasoning for your decision…"
            error={!!decisionForm.formState.errors.comments}
            {...decisionForm.register('comments')}
          />
        </FormField>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={decisionForm.formState.isSubmitting || createDecision.isPending}
          >
            Submit Decision
          </Button>
        </div>
      </form>
    );
  } else {
    decisionContent = <p className="mt-2 text-sm text-muted">No final editorial decision has been recorded yet.</p>;
  }

  if (!canViewPage) {
    return (
      <ErrorState
        message="You do not have permission to manage this article workflow."
      />
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link href={`/articles/${id}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to Article
        </Link>
      </div>

      <PageHeader title="Editorial Decision" description={article.title} />

      <div className="space-y-6">
        {canAssign && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Users className="w-5 h-5" /> Assign Reviewers
              </h2>
            </CardHeader>

            <ReviewerAssignmentsPanel
              assignments={assignments}
              loading={assignmentsQuery.isLoading}
              canManage={canAssign}
              onRemove={(assignmentId) => deleteAssignment.mutate(assignmentId)}
            />

            <AssignReviewersForm articleId={id} />
          </Card>
        )}

        {(canRecordDecision || canSeeAuthorDecision) && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-primary">Final Editorial Decision</h2>
            </CardHeader>
            {decisionContent}
          </Card>
        )}

        {canSeeReviews && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-primary">Peer reviews</h2>
            </CardHeader>
            <div className="mt-2">
              <ArticleReviewsPanel articleId={id} />
            </div>
          </Card>
        )}

        {adminView && <AdminFinalDecisionPanel articleId={id} decision={decision} />}
      </div>
    </div>
  );
}
