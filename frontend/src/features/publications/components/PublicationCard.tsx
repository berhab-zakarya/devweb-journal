'use client';

import Link from 'next/link';
import { Calendar, BookOpen } from 'lucide-react';
import type { PublicationListItem } from '../types/Publication.types';

export function PublicationCard({ publication }: Readonly<{ publication: PublicationListItem }>) {
  const pub = publication;
  const publishDate = new Date(pub.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group bg-surface border border-subtle rounded-xl flex flex-col h-full hover:border-brand-500/40 hover:shadow-panel transition-all duration-150 overflow-hidden">
      {/* Top accent bar */}
      <div className="h-0.5 bg-linear-to-r from-brand-500/40 to-transparent" />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
            Published
          </span>
          {pub.category_name && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-secondary">
              {pub.category_name}
            </span>
          )}
          {(pub.volume || pub.issue) && (
            <span className="text-xs text-muted font-medium ml-auto shrink-0">
              {pub.volume && `Vol. ${pub.volume}`}
              {pub.volume && pub.issue && ' · '}
              {pub.issue && `No. ${pub.issue}`}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/journal/${pub.id}`}
            className="block text-base font-semibold text-primary leading-snug line-clamp-2 wrap-break-word group-hover:text-brand-600 transition-colors duration-150"
          >
            {pub.title ?? `Publication #${pub.id}`}
          </Link>

          {pub.author_name && (
            <p className="text-sm text-secondary mt-1.5 truncate font-medium">{pub.author_name}</p>
          )}

          {pub.abstract && (
            <p className="text-sm text-muted mt-2.5 line-clamp-3 leading-relaxed wrap-break-word">
              {pub.abstract}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-subtle">
          <div className="flex items-center gap-1.5 text-xs text-muted min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span className="truncate">{publishDate}</span>
            {pub.doi && (
              <>
                <span className="text-subtle mx-1">·</span>
                <span className="font-mono truncate max-w-25" title={`DOI: ${pub.doi}`}>
                  {pub.doi}
                </span>
              </>
            )}
          </div>
          <Link
            href={`/journal/${pub.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 shrink-0 transition-colors"
            aria-label={`Read more about ${pub.title}`}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden />
            Read
          </Link>
        </div>
      </div>
    </article>
  );
}
