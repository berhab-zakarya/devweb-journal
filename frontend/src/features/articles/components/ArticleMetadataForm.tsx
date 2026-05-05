'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { FormField, Input, Textarea, Select } from '@/shared/components/ui';
import type { Category } from '@/features/categories/types/Category.types';

export const articleMetadataSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  abstract: z.string().min(50, 'Abstract must be at least 50 characters'),
  keywords: z.string().min(2, 'Keywords are required'),
  category_id: z.coerce.number().min(1, 'Please select a category'),
});

export type ArticleMetadataFormValues = z.infer<typeof articleMetadataSchema>;

type Register = UseFormRegister<ArticleMetadataFormValues>;

export function ArticleMetadataForm({
  categories,
  register,
  errors,
}: Readonly<{
  categories: Category[];
  register: Register;
  errors: FieldErrors<ArticleMetadataFormValues>;
}>) {
  return (
    <div className="space-y-5">
      <FormField id="title" label="Title" required error={errors.title?.message}>
        <Input
          id="title"
          type="text"
          placeholder="Article title"
          error={!!errors.title}
          {...register('title')}
        />
      </FormField>

      <FormField
        id="abstract"
        label="Abstract"
        required
        error={errors.abstract?.message}
        hint="Minimum 50 characters"
      >
        <Textarea
          id="abstract"
          rows={5}
          placeholder="Provide a concise summary of your research…"
          error={!!errors.abstract}
          {...register('abstract')}
        />
      </FormField>

      <FormField
        id="keywords"
        label="Keywords"
        required
        error={errors.keywords?.message}
        hint="Comma-separated list"
      >
        <Input
          id="keywords"
          type="text"
          placeholder="e.g. machine learning, NLP, deep learning"
          error={!!errors.keywords}
          {...register('keywords')}
        />
      </FormField>

      <FormField id="category_id" label="Category" required error={errors.category_id?.message}>
        <Select id="category_id" error={!!errors.category_id} {...register('category_id')}>
          <option value="">Select a category…</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
