'use client';

import Link from 'next/link';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { LoadingState, ErrorState } from '@/shared/components/ui';
import { usePublication } from '../hooks/usePublication';
import { PublicationDownloadButton } from './PublicationDownloadButton';

export function PublicationDetailPage({ id }: { id: number }) {
  const { data: pub, isLoading, isError, refetch } = usePublication(id);

  if (isLoading) return <LoadingState rows={5} />;
  if (isError) return <ErrorState message="Could not load publication." onRetry={() => refetch()} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/journal" className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to Journal
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            {(pub!.volume || pub!.issue) && (
              <p className="text-xs text-muted">
                {pub!.volume && `Vol. ${pub!.volume}`}
                {pub!.volume && pub!.issue && ' · '}
                {pub!.issue && `Issue ${pub!.issue}`}
              </p>
            )}
            <p className="text-xs text-muted">
              Published {new Date(pub!.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <PublicationDownloadButton publicationId={id} />
      </div>

      <h1 className="text-2xl font-bold text-primary leading-snug mb-3">
        {pub!.title ?? `Publication #${id}`}
      </h1>

      <p className="text-sm text-muted mb-1">{pub!.author_name}</p>

      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700 mb-4">
        {pub!.category_name}
      </span>

      {pub!.doi && (
        <p className="text-xs text-muted font-mono mb-6">DOI: {pub!.doi}</p>
      )}

      {pub!.keywords && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Keywords</p>
          <p className="text-sm text-secondary">{pub!.keywords}</p>
        </div>
      )}

      {pub!.abstract && (
        <div className="bg-muted rounded-lg p-5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Abstract</p>
          <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">{pub!.abstract}</p>
        </div>
      )}
    </div>
  );
}
