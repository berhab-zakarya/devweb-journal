'use client';

import Link from 'next/link';
import { ChevronLeft, BookOpen, Calendar, User, Tag, Hash } from 'lucide-react';
import { LoadingState, ErrorState } from '@/shared/components/ui';
import { usePublication } from '../hooks/usePublication';
import { PublicationDownloadButton } from './PublicationDownloadButton';

export function PublicationDetailPage({ id }: { id: number }) {
  const { data: pub, isLoading, isError, refetch } = usePublication(id);

  if (isLoading) return <LoadingState rows={5} />;
  if (isError) return <ErrorState message="Could not load publication." onRetry={() => refetch()} />;

  const publishDate = new Date(pub!.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const keywords = pub!.keywords
    ? pub!.keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-secondary transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Back to Journal
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-surface border border-subtle rounded-xl p-6 md:p-8 shadow-card">
        {/* Status + category */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
            Published
          </span>
          {pub!.category_name && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-secondary">
              <Tag className="w-3 h-3" aria-hidden />
              {pub!.category_name}
            </span>
          )}
          {(pub!.volume || pub!.issue) && (
            <span className="text-xs text-muted font-medium">
              {pub!.volume && `Volume ${pub!.volume}`}
              {pub!.volume && pub!.issue && ' · '}
              {pub!.issue && `Issue ${pub!.issue}`}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-primary leading-snug wrap-break-word mb-4">
          {pub!.title ?? `Publication #${id}`}
        </h1>

        {/* Author + date row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary pb-4 border-b border-subtle">
          {pub!.author_name && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-muted shrink-0" aria-hidden />
              {pub!.author_name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted shrink-0" aria-hidden />
            {publishDate}
          </span>
          {pub!.doi && (
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
              <Hash className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="wrap-break-word">DOI: {pub!.doi}</span>
            </span>
          )}
        </div>

        {/* Download action */}
        <div className="mt-4">
          <PublicationDownloadButton publicationId={id} />
        </div>
      </div>

      {/* Content columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Abstract */}
        {pub!.abstract && (
          <div className="min-w-0 overflow-hidden bg-surface border border-subtle rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-brand-500 shrink-0" aria-hidden />
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Abstract</h2>
            </div>
            <p className="text-sm text-secondary leading-relaxed wrap-break-word">
              {pub!.abstract}
            </p>
          </div>
        )}

        {/* Sidebar: keywords + metadata */}
        <div className="min-w-0 space-y-4">
          {keywords.length > 0 && (
            <div className="bg-surface border border-subtle rounded-xl p-5 shadow-card">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-soft-blue text-brand-700 border border-blue-100"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface border border-subtle rounded-xl p-5 shadow-card space-y-3">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">Details</h2>
            {pub!.category_name && (
              <div>
                <p className="text-xs text-muted mb-0.5">Category</p>
                <p className="text-sm font-medium text-primary">{pub!.category_name}</p>
              </div>
            )}
            {(pub!.volume || pub!.issue) && (
              <div>
                <p className="text-xs text-muted mb-0.5">Volume / Issue</p>
                <p className="text-sm font-medium text-primary">
                  {pub!.volume && `Vol. ${pub!.volume}`}
                  {pub!.volume && pub!.issue && ' · '}
                  {pub!.issue && `No. ${pub!.issue}`}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted mb-0.5">Published</p>
              <p className="text-sm font-medium text-primary">{publishDate}</p>
            </div>
            {pub!.doi && (
              <div>
                <p className="text-xs text-muted mb-0.5">DOI</p>
                <p className="text-xs font-mono text-secondary wrap-break-word">{pub!.doi}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
