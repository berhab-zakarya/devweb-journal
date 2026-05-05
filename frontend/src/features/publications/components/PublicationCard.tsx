'use client';

import Link from 'next/link';
import { Card } from '@/shared/components/ui';
import type { PublicationListItem } from '../types/Publication.types';

export function PublicationCard({ publication }: Readonly<{ publication: PublicationListItem }>) {
  const pub = publication;
  return (
    <Card className="hover:shadow-panel transition-shadow duration-150">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/journal/${pub.id}`}
            className="text-lg font-semibold text-primary hover:text-brand-600 transition-colors leading-snug"
          >
            {pub.title ?? `Publication #${pub.id}`}
          </Link>

          {pub.author_name && <p className="text-sm text-secondary mt-1">{pub.author_name}</p>}

          {pub.abstract && (
            <p className="text-sm text-secondary mt-2 line-clamp-2">{pub.abstract}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Published
            </span>
            {pub.category_name && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700">
                {pub.category_name}
              </span>
            )}
            {pub.doi && <span className="text-xs text-muted font-mono">DOI: {pub.doi}</span>}
            {(pub.volume || pub.issue) && (
              <span className="text-xs text-muted">
                {pub.volume && `Vol. ${pub.volume}`}
                {pub.volume && pub.issue && ' · '}
                {pub.issue && `Issue ${pub.issue}`}
              </span>
            )}
            <span className="text-xs text-muted">
              {new Date(pub.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <Link
          href={`/journal/${pub.id}`}
          className="shrink-0 text-sm text-brand-600 hover:underline font-medium whitespace-nowrap"
        >
          Read →
        </Link>
      </div>
    </Card>
  );
}
