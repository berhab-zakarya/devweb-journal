'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField, Input, Textarea, Button } from '@/shared/components/ui';

export interface ReviewFormValues {
  recommendation: string;
  comments: string;
  is_draft: boolean;
}

export function ReviewForm({
  register,
  errors,
  generalError,
  draftHint,
  isSubmitting,
  submitPending,
}: Readonly<{
  register: UseFormRegister<ReviewFormValues>;
  errors: FieldErrors<ReviewFormValues>;
  generalError: string;
  draftHint?: boolean;
  isSubmitting: boolean;
  submitPending: boolean;
}>) {
  return (
    <>
      {generalError && (
        <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
          {generalError}
        </div>
      )}
      {draftHint && (
        <div
          aria-live="polite"
          className="px-3 py-2.5 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-700"
        >
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

      <FormField
        id="comments"
        label="Review Comments"
        required
        error={errors.comments?.message}
        hint="Provide detailed feedback for the authors"
      >
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
        <Button type="submit" variant="primary" loading={isSubmitting || submitPending}>
          Submit Review
        </Button>
      </div>
    </>
  );
}
