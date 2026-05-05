'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { FormField, Input } from '@/shared/components/ui';

export const publicationMetadataSchema = z.object({
  published_at: z.string().min(1, 'Publication date is required'),
  doi: z.string().min(1, 'DOI is required'),
  volume: z.coerce.number().min(1, 'Volume is required'),
  issue: z.coerce.number().min(1, 'Issue is required'),
});

export type PublicationMetadataFormValues = z.infer<typeof publicationMetadataSchema>;

/** Payload shape for POST /articles/{id}/publish (strings for volume/issue per API). */
export function toPublishPayload(values: PublicationMetadataFormValues) {
  return {
    published_at: values.published_at,
    doi: values.doi.trim(),
    volume: String(values.volume),
    issue: String(values.issue),
  };
}

export function PublicationMetadataForm({
  register,
  errors,
}: Readonly<{
  register: UseFormRegister<PublicationMetadataFormValues>;
  errors: FieldErrors<PublicationMetadataFormValues>;
}>) {
  return (
    <div className="space-y-5">
      <FormField id="published_at" label="Publication date" required error={errors.published_at?.message}>
        <Input
          id="published_at"
          type="datetime-local"
          error={!!errors.published_at}
          {...register('published_at')}
        />
      </FormField>

      <FormField id="doi" label="DOI" required error={errors.doi?.message}>
        <Input id="doi" type="text" placeholder="10.xxxx/..." error={!!errors.doi} {...register('doi')} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField id="volume" label="Volume" required error={errors.volume?.message}>
          <Input id="volume" type="number" min={1} error={!!errors.volume} {...register('volume')} />
        </FormField>
        <FormField id="issue" label="Issue" required error={errors.issue?.message}>
          <Input id="issue" type="number" min={1} error={!!errors.issue} {...register('issue')} />
        </FormField>
      </div>
    </div>
  );
}
