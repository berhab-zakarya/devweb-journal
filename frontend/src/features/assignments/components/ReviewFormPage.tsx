'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Textarea,
  Button,
  LoadingState,
} from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { assignmentReviewQueryOptions } from '../queries/assignments.queries';
import { useSubmitReviewMutation } from '../mutations/assignments.mutations';

const schema = z.object({
  recommendation: z.string().min(1, 'Recommendation is required'),
  comments:       z.string().min(10, 'Comments must be at least 10 characters'),
  is_draft:       z.boolean(),
});
type FormData = z.infer<typeof schema>;

export function ReviewFormPage({ assignmentId }: { assignmentId: number }) {
  const router = useRouter();
  const [generalError, setGeneralError] = useState('');

  const existingReviewQuery = useQuery({ ...assignmentReviewQueryOptions(assignmentId), retry: false });
  const submitReview = useSubmitReviewMutation(assignmentId);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_draft: false },
  });

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    submitReview.mutate(data, {
      onSuccess: () => router.push(`/assignments/${assignmentId}`),
      onError: (error) => {
        const fieldErrors = getLaravelFieldErrors(error);
        if (Object.keys(fieldErrors).length > 0) {
          for (const [field, message] of Object.entries(fieldErrors)) {
            setError(field as keyof FormData, { message });
          }
        } else {
          setGeneralError(getErrorMessage(error));
        }
      },
    });
  };

  if (existingReviewQuery.isLoading) return <LoadingState rows={3} />;

  const existingReview = existingReviewQuery.data;

  return (
    <div>
      <div className="mb-4">
        <Link href={`/assignments/${assignmentId}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to Assignment
        </Link>
      </div>

      <PageHeader
        title={existingReview && !existingReview.is_draft ? 'Review Submitted' : 'Submit Review'}
        description={`Assignment #${assignmentId}`}
      />

      <div className="max-w-2xl">
        {existingReview && !existingReview.is_draft ? (
          <Card>
            <p className="text-sm text-muted mb-4">Your review has been submitted.</p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-muted">Recommendation</dt>
                <dd className="mt-1 text-primary">{existingReview.recommendation}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Comments</dt>
                <dd className="mt-1 text-secondary whitespace-pre-wrap">{existingReview.comments}</dd>
              </div>
            </dl>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {generalError && (
                <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
                  {generalError}
                </div>
              )}
              {existingReview?.is_draft && (
                <div aria-live="polite" className="px-3 py-2.5 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  You have a saved draft. Submit when ready.
                </div>
              )}

              <FormField id="recommendation" label="Recommendation" required error={errors.recommendation?.message}>
                <Input
                  id="recommendation"
                  type="text"
                  placeholder="e.g. Accept, Major Revision, Reject"
                  error={!!errors.recommendation}
                  {...register('recommendation')}
                />
              </FormField>

              <FormField id="comments" label="Review Comments" required error={errors.comments?.message}
                hint="Provide detailed feedback for the authors">
                <Textarea
                  id="comments"
                  rows={8}
                  placeholder="Your review comments…"
                  error={!!errors.comments}
                  {...register('comments')}
                />
              </FormField>

              <div className="flex items-center justify-end gap-3">
                <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-strong text-brand-600 focus:ring-brand-500"
                    {...register('is_draft')}
                  />
                  Save as draft
                </label>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting || submitReview.isPending}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
