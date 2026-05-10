'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { PageHeader, Card, Button, LoadingState, ErrorState } from '@/shared/components/ui';
import { useArticle } from '@/features/articles/hooks/useArticle';
import { usePublishArticleMutation } from '../mutations/publications.mutations';
import {
  PublicationMetadataForm,
  publicationMetadataSchema,
  type PublicationMetadataFormValues,
  toPublishPayload,
} from './PublicationMetadataForm';
import { PublishArticleDialog } from './PublishArticleDialog';

function defaultPublishedAtLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PublishArticlePage({ articleId }: Readonly<{ articleId: number }>) {
  const router = useRouter();
  const articleQuery = useArticle(articleId);
  const publish = usePublishArticleMutation(articleId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<PublicationMetadataFormValues | null>(null);

  const defaults = useMemo(
    (): PublicationMetadataFormValues => ({
      published_at: defaultPublishedAtLocal(),
      doi: '',
      volume: 1,
      issue: 1,
    }),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicationMetadataFormValues>({
    resolver: zodResolver(publicationMetadataSchema),
    defaultValues: defaults,
  });

  if (articleQuery.isLoading) return <LoadingState rows={4} />;
  if (articleQuery.isError) {
    return <ErrorState message="Could not load article." onRetry={() => articleQuery.refetch()} />;
  }

  const article = articleQuery.data!;
  if (article.status !== 'accepted') {
    return (
      <div>
        <PageHeader title="Publish article" description="Only accepted articles can be published." />
        <p className="text-sm text-muted mb-4">This article is not in accepted status.</p>
        <Link href={`/articles/${articleId}`} className="text-sm text-brand-600 hover:underline">
          Back to article
        </Link>
      </div>
    );
  }

  if (article.publication) {
    return (
      <div>
        <PageHeader title="Already published" description={article.title} />
        <p className="text-sm text-secondary mb-4">This article already has a publication record.</p>
        <Link href={`/articles/${articleId}`} className="text-sm text-brand-600 hover:underline">
          Back to article
        </Link>
      </div>
    );
  }

  const onSubmit = (data: PublicationMetadataFormValues) => {
    setPendingValues(data);
    setConfirmOpen(true);
  };

  const confirmPublish = () => {
    if (!pendingValues) return;
    publish.mutate(toPublishPayload(pendingValues), {
      onSuccess: () => {
        setConfirmOpen(false);
        router.push(`/articles/${articleId}`);
      },
    });
  };

  return (
    <div className="w-full min-w-0 max-w-2xl">
      <div className="mb-4">
        <Link
          href={`/articles/${articleId}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary"
        >
          <ChevronLeft className="w-4 h-4" /> Back to article
        </Link>
      </div>

      <PageHeader title="Publish article" description={article.title} />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <PublicationMetadataForm register={register} errors={errors} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Review &amp; publish
            </Button>
          </div>
        </form>
      </Card>

      <PublishArticleDialog
        open={confirmOpen}
        onClose={() => !publish.isPending && setConfirmOpen(false)}
        values={pendingValues}
        onConfirm={confirmPublish}
        isPending={publish.isPending}
      />
    </div>
  );
}
