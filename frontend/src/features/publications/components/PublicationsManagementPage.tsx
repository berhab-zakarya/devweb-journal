'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  TableContainer,
  TableWrapper,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
} from '@/shared/components/ui';
import { useArticlesInfinite } from '@/features/articles/hooks/useArticlesInfinite';
import type { Article } from '@/features/articles/types/Article.types';
import { usePublicationsInfinite } from '../hooks/usePublicationsInfinite';
import type { PublicationListItem } from '../types/Publication.types';
import { AcceptedArticlesQueue } from './AcceptedArticlesQueue';

export function PublicationsManagementPage() {
  const articlesQuery = useArticlesInfinite();
  const pubsQuery = usePublicationsInfinite();

  const acceptedQueue = useMemo(() => {
    const pages = articlesQuery.data?.pages ?? [];
    const list: Article[] = [];
    for (const p of pages) {
      for (const a of p.items) {
        if (a.status === 'accepted' && !a.publication) {
          list.push(a);
        }
      }
    }
    return list;
  }, [articlesQuery.data?.pages]);

  const publishedRows = useMemo(() => {
    const pages = pubsQuery.data?.pages ?? [];
    const list: PublicationListItem[] = [];
    for (const p of pages) {
      list.push(...p.items);
    }
    list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return list;
  }, [pubsQuery.data?.pages]);

  const error = articlesQuery.isError || pubsQuery.isError;

  if (error) {
    return (
      <div>
        <PageHeader title="Publications" description="Accepted queue and published catalogue" />
        <ErrorState
          message="Could not load data."
          onRetry={() => {
            articlesQuery.refetch();
            pubsQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Publications"
        description="Accepted articles awaiting publication, then the published catalogue"
      />

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Accepted — awaiting publication
        </h2>
        <AcceptedArticlesQueue
          articles={acceptedQueue}
          loading={articlesQuery.isLoading}
          hasNextPage={articlesQuery.hasNextPage}
          fetchNextPage={() => articlesQuery.fetchNextPage()}
          isFetchingNextPage={articlesQuery.isFetchingNextPage}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Published articles
        </h2>
        {pubsQuery.isLoading && <LoadingState variant="list" rows={4} />}
        {!pubsQuery.isLoading && publishedRows.length === 0 && (
          <p className="text-sm text-muted py-6">No published articles yet.</p>
        )}
        {!pubsQuery.isLoading && publishedRows.length > 0 && (
          <>
            <TableContainer>
              <TableWrapper>
                <TableHead>
                  <Th>Title</Th>
                  <Th>DOI</Th>
                  <Th>Vol.</Th>
                  <Th>Iss.</Th>
                  <Th>Published</Th>
                  <Th> </Th>
                </TableHead>
                <TableBody>
                  {publishedRows.map((row) => (
                    <Tr key={row.id}>
                      <Td className="max-w-xs">
                        <span className="font-medium truncate block">{row.title}</span>
                      </Td>
                      <Td className="text-secondary whitespace-nowrap">{row.doi ?? '—'}</Td>
                      <Td className="text-secondary">{row.volume ?? '—'}</Td>
                      <Td className="text-secondary">{row.issue ?? '—'}</Td>
                      <Td className="text-secondary whitespace-nowrap">
                        {new Date(row.published_at).toLocaleDateString()}
                      </Td>
                      <Td align="right">
                        <Link
                          href={`/journal/${row.id}`}
                          className="text-brand-600 hover:underline font-medium text-sm"
                        >
                          View
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </TableBody>
              </TableWrapper>
            </TableContainer>
            {pubsQuery.hasNextPage && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  className="h-9 px-3 text-sm rounded border border-strong bg-surface text-secondary hover:bg-muted"
                  onClick={() => pubsQuery.fetchNextPage()}
                  disabled={pubsQuery.isFetchingNextPage}
                >
                  {pubsQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
