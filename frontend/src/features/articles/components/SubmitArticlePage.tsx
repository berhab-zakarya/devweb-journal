'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PageHeader,
  Card,
  Button,
  FileUpload,
  FormField,
} from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCreateArticleMutation } from '../mutations/articles.mutations';
import { useCategories } from '../../categories/hooks/useCategories';
import {
  ArticleMetadataForm,
  articleMetadataSchema,
  type ArticleMetadataFormValues,
} from './ArticleMetadataForm';

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
  } = useForm<ArticleMetadataFormValues>({ resolver: zodResolver(articleMetadataSchema) });

  const onSubmit = (data: ArticleMetadataFormValues) => {
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
              setError(field as keyof ArticleMetadataFormValues, { message });
            }
          } else {
            setGeneralError(getErrorMessage(error));
          }
        },
      }
    );
  };

  return (
    <div className="w-full min-w-0 max-w-3xl">
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

          <ArticleMetadataForm categories={categories} register={register} errors={errors} />

          <FormField id="pdf" label="Manuscript PDF" required error={pdfError}>
            <FileUpload
              accept=".pdf"
              maxSizeMB={20}
              value={pdfFile}
              onChange={(file) => {
                setPdfFile(file);
                setPdfError('');
              }}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting || create.isPending}>
              Submit Article
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
