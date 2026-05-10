'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField, Textarea, Button } from '@/shared/components/ui';

export interface ReviewFormValues {
  is_draft: boolean;
  originality_score: number | null;
  methodology_score: number | null;
  clarity_score: number | null;
  overall_score: number | null;
  recommendation: string;
  comments: string;
}

const SCORE_INPUT_CLASS =
  'w-full h-10 px-3 text-sm border border-strong rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-primary';

const SELECT_CLASS =
  'w-full h-10 px-3 text-sm border border-strong rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-primary';

interface ScoreFieldProps {
  id: keyof ReviewFormValues;
  label: string;
  register: UseFormRegister<ReviewFormValues>;
  error?: string;
}

function ScoreField({ id, label, register, error }: Readonly<ScoreFieldProps>) {
  return (
    <FormField id={id} label={label} required hint="0 – 10" error={error}>
      <input
        id={id}
        type="number"
        min={0}
        max={10}
        step={1}
        className={SCORE_INPUT_CLASS}
        {...register(id, { valueAsNumber: true })}
      />
    </FormField>
  );
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
          You have a saved draft. Complete all fields and submit when ready.
        </div>
      )}

      {/* Scores — 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreField
          id="originality_score"
          label="Originality"
          register={register}
          error={errors.originality_score?.message}
        />
        <ScoreField
          id="methodology_score"
          label="Methodology"
          register={register}
          error={errors.methodology_score?.message}
        />
        <ScoreField
          id="clarity_score"
          label="Clarity"
          register={register}
          error={errors.clarity_score?.message}
        />
        <ScoreField
          id="overall_score"
          label="Overall"
          register={register}
          error={errors.overall_score?.message}
        />
      </div>

      {/* Recommendation — exact backend enum values */}
      <FormField
        id="recommendation"
        label="Recommendation"
        required
        error={errors.recommendation?.message}
      >
        <select id="recommendation" className={SELECT_CLASS} {...register('recommendation')}>
          <option value="">— Select recommendation —</option>
          <option value="accept">Accept</option>
          <option value="minor_revision">Minor Revision</option>
          <option value="major_revision">Major Revision</option>
          <option value="reject">Reject</option>
        </select>
      </FormField>

      {/* Comments */}
      <FormField
        id="comments"
        label="Review Comments"
        required
        error={errors.comments?.message}
        hint="Provide detailed feedback for the authors (min. 10 characters)"
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
