'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader, Card, Button, LoadingState, ErrorState } from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useArticle } from '../hooks/useArticle';
import { useUpdateArticleMutation } from '../mutations/articles.mutations';
import { ArticleMetadataForm, articleMetadataSchema, type ArticleMetadataFormValues } from './ArticleMetadataForm';

export function EditArticlePage({ id }: Readonly<{ id: number }>) {
  const router = useRouter();
  const articleQuery = useArticle(id);
  const { data: categories = [] } = useCategories();
  const update = useUpdateArticleMutation(id);
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ArticleMetadataFormValues>({
    resolver: zodResolver(articleMetadataSchema),
  });

  useEffect(() => {
    const a = articleQuery.data;
    if (!a) return;
    reset({
      title: a.title,
      abstract: a.abstract,
      keywords: a.keywords,
      category_id: a.category_id,
    });
  }, [articleQuery.data, reset]);

  if (articleQuery.isLoading) return <LoadingState rows={4} />;
  if (articleQuery.isError) {
    return <ErrorState message="Could not load article." onRetry={() => articleQuery.refetch()} />;
  }

  const onSubmit = (data: ArticleMetadataFormValues) => {
    setGeneralError('');
    update.mutate(data, {
      onSuccess: () => router.push(`/articles/${id}`),
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
    });
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit article"
        description="Update metadata for your submission"
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {generalError && (
            <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
              {generalError}
            </div>
          )}

          <ArticleMetadataForm categories={categories} register={register} errors={errors} />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting || update.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
