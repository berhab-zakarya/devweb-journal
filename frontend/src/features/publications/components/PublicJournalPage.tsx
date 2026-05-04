'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';
import {
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
  Pagination,
  Card,
} from '@/shared/components/ui';
import { usePublications } from '../hooks/usePublications';

export function PublicJournalPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = usePublications({ search: search || undefined, page });

  const publications = data?.data?.data ?? [];
  const total = data?.data?.meta?.total ?? 0;
  const lastPage = data?.data?.meta?.last_page ?? 1;
  const perPage = data?.data?.meta?.per_page ?? 15;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-50 mb-4">
          <BookOpen className="w-7 h-7 text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold text-primary">DevWeb Journal</h1>
        <p className="text-base text-muted mt-2">Browse peer-reviewed articles published by our editorial team</p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-md mx-auto">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search publications…"
        />
      </div>

      {isLoading && <LoadingState variant="list" rows={5} />}

      {isError && (
        <ErrorState message="Could not load publications." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && publications.length === 0 && (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title={search ? 'No results found' : 'No publications yet'}
          description={search ? 'Try a different search term.' : 'Check back later for new publications.'}
          className="py-16"
        />
      )}

      {!isLoading && !isError && publications.length > 0 && (
        <>
          <div className="space-y-4">
            {publications.map((pub) => (
              <Card key={pub.id} className="hover:shadow-panel transition-shadow duration-150">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/journal/${pub.id}`}
                      className="text-lg font-semibold text-primary hover:text-brand-600 transition-colors leading-snug"
                    >
                      {pub.title ?? `Publication #${pub.id}`}
                    </Link>

                    {pub.abstract && (
                      <p className="text-sm text-secondary mt-2 line-clamp-2">
                        {pub.abstract}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {pub.category_name && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700">
                          {pub.category_name}
                        </span>
                      )}
                      {pub.doi && (
                        <span className="text-xs text-muted font-mono">DOI: {pub.doi}</span>
                      )}
                      {(pub.volume || pub.issue) && (
                        <span className="text-xs text-muted">
                          {pub.volume && `Vol. ${pub.volume}`}
                          {pub.volume && pub.issue && ' · '}
                          {pub.issue && `Issue ${pub.issue}`}
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        {new Date(pub.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            ))}
          </div>

          {total > perPage && (
            <div className="mt-8">
              <Pagination
                page={page}
                lastPage={lastPage}
                total={total}
                from={(page - 1) * perPage + 1}
                to={Math.min(page * perPage, total)}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
