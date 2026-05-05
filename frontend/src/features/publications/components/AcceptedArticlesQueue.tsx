'use client';

import Link from 'next/link';
import { ArticleStatusBadge, Button } from '@/shared/components/ui';
import { cn } from '@/shared/utils/cn';

const publishLinkClass = cn(
  'inline-flex items-center justify-center rounded font-primary font-medium transition-colors duration-150',
  'h-8 px-3 py-1 text-sm',
  'bg-brand-600 text-inverse hover:bg-brand-700 font-semibold'
);
import type { Article } from '@/features/articles/types/Article.types';

export function AcceptedArticlesQueue({
  articles,
  loading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: Readonly<{
  articles: Article[];
  loading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}>) {
  if (loading) {
    return <p className="text-sm text-muted py-6">Loading articles…</p>;
  }

  if (articles.length === 0) {
    return (
      <p className="text-sm text-muted py-6">No accepted articles waiting for publication.</p>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-subtle border border-subtle rounded-lg overflow-hidden">
        {articles.map((a) => (
          <li key={a.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary truncate">{a.title}</p>
              <p className="text-xs text-muted mt-0.5">
                {a.author?.name ?? '—'} · <ArticleStatusBadge status={a.status} />
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Link
                href={`/articles/${a.id}`}
                className="text-sm text-brand-600 hover:underline"
              >
                View
              </Link>
              <Link href={`/articles/${a.id}/publish`} className={publishLinkClass}>
                Publish
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
