'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Textarea,
  Select,
  Button,
  FileUpload,
} from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCreateArticleMutation } from '../mutations/articles.mutations';
import { useCategories } from '../../categories/hooks/useCategories';

const schema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  abstract:    z.string().min(50, 'Abstract must be at least 50 characters'),
  keywords:    z.string().min(2, 'Keywords are required'),
  category_id: z.coerce.number().min(1, 'Please select a category'),
});

type FormData = z.infer<typeof schema>;

export function SubmitArticlePage() {
  const router = useRouter();
  const create = useCreateArticleMutation();
  const { data: categories = [] } = useCategories();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    if (!pdfFile) {
      setPdfError('PDF file is required');
      return;
    }
    setPdfError('');
    setGeneralError('');

    create.mutate(
      { ...data, pdf: pdfFile },
      {
        onSuccess: (article) => router.push(`/articles/${article.id}`),
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
      }
    );
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Submit Article"
        description="Fill in the details below and upload your manuscript PDF"
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {generalError && (
            <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
              {generalError}
            </div>
          )}

          <FormField id="title" label="Title" required error={errors.title?.message}>
            <Input
              id="title"
              type="text"
              placeholder="Article title"
              error={!!errors.title}
              {...register('title')}
            />
          </FormField>

          <FormField id="abstract" label="Abstract" required error={errors.abstract?.message}
            hint="Minimum 50 characters">
            <Textarea
              id="abstract"
              rows={5}
              placeholder="Provide a concise summary of your research…"
              error={!!errors.abstract}
              {...register('abstract')}
            />
          </FormField>

          <FormField id="keywords" label="Keywords" required error={errors.keywords?.message}
            hint="Comma-separated list">
            <Input
              id="keywords"
              type="text"
              placeholder="e.g. machine learning, NLP, deep learning"
              error={!!errors.keywords}
              {...register('keywords')}
            />
          </FormField>

          <FormField id="category_id" label="Category" required error={errors.category_id?.message}>
            <Select
              id="category_id"
              error={!!errors.category_id}
              {...register('category_id')}
            >
              <option value="">Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField id="pdf" label="Manuscript PDF" required error={pdfError}>
            <FileUpload
              accept=".pdf"
              maxSizeMB={20}
              value={pdfFile}
              onChange={(file) => { setPdfFile(file); setPdfError(''); }}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting || create.isPending}
            >
              Submit Article
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
