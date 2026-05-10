'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search } from 'lucide-react';
import { EmptyState, LoadingState, ErrorState, Pagination } from '@/shared/components/ui';
import { usePublications } from '../hooks/usePublications';
import { publicationsVolumesQueryOptions } from '../queries/publications.queries';
import type { PublicationListItem } from '../types/Publication.types';
import { PublicationCard } from './PublicationCard';
import { PublicationFilters } from './PublicationFilters';

function groupByYearAndVolume(items: PublicationListItem[]): { label: string; items: PublicationListItem[] }[] {
  const map = new Map<string, PublicationListItem[]>();
  const order: string[] = [];

  for (const p of items) {
    const y = new Date(p.published_at).getFullYear();
    const vol = p.volume ?? '—';
    const key = `${y}__${vol}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(p);
  }

  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  order.sort((a, b) => {
    const [ya, va] = a.split('__');
    const [yb, vb] = b.split('__');
    if (ya !== yb) return Number(yb) - Number(ya);
    return String(va).localeCompare(String(vb), undefined, { numeric: true });
  });

  return order.map((key) => {
    const [y, vol] = key.split('__');
    return { label: `${y} · Volume ${vol}`, items: map.get(key)! };
  });
}

export function PublicJournalPage() {
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [page, setPage] = useState(1);

  const { data: volumes = [] } = useQuery(publicationsVolumesQueryOptions());

  const yearOptions = useMemo(() => {
    const ys = new Set<number>();
    for (const v of volumes) {
      if (typeof v.year === 'number' && v.year > 0) {
        ys.add(v.year);
      }
    }
    return Array.from(ys).sort((a, b) => b - a);
  }, [volumes]);

  const volumeOptionsForYear = useMemo(() => {
    if (year === '') {
      return Array.from(new Set(volumes.map((v) => v.volume).filter(Boolean))) as string[];
    }
    return Array.from(
      new Set(volumes.filter((v) => v.year === year).map((v) => v.volume).filter(Boolean))
    ) as string[];
  }, [volumes, year]);

  const issueOptionsForFilters = useMemo(() => {
    let rows = volumes;
    if (year !== '') rows = rows.filter((v) => v.year === year);
    if (volume) rows = rows.filter((v) => String(v.volume ?? '') === volume);
    return Array.from(new Set(rows.map((v) => v.issue).filter(Boolean))) as string[];
  }, [volumes, year, volume]);

  const { data, isLoading, isError, refetch } = usePublications({
    search: search || undefined,
    author: author.trim() || undefined,
    year: year === '' ? undefined : year,
    volume: volume || undefined,
    issue: issue || undefined,
    page,
  });

  const publications = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? publications.length;
  const lastPage = meta?.last_page ?? 1;
  const perPage = meta?.per_page ?? (publications.length || 12);

  const groupedSections = useMemo(() => groupByYearAndVolume(publications), [publications]);

  return (
    <div className="w-full min-w-0">
      {/* Editorial header */}
      <div className="mb-8 pb-6 border-b border-subtle">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-soft-blue flex items-center justify-center shrink-0 border border-blue-100">
            <BookOpen className="w-5 h-5 text-brand-600" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">Journal Publications</h1>
            <p className="text-sm text-muted mt-1 leading-relaxed max-w-xl">
              Peer-reviewed research published by the DevWeb Journal editorial board.
            </p>
          </div>
        </div>
      </div>

      <PublicationFilters
        search={search}
        author={author}
        year={year}
        yearOptions={yearOptions}
        volume={volume}
        issue={issue}
        volumeOptions={volumeOptionsForYear}
        issueOptions={issueOptionsForFilters}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAuthorChange={(v) => {
          setAuthor(v);
          setPage(1);
        }}
        onYearChange={(y) => {
          setYear(y);
          setVolume('');
          setIssue('');
          setPage(1);
        }}
        onVolumeChange={(v) => {
          setVolume(v);
          setIssue('');
          setPage(1);
        }}
        onIssueChange={(iss) => {
          setIssue(iss);
          setPage(1);
        }}
      />

      {isLoading && <LoadingState variant="list" rows={5} />}

      {isError && <ErrorState message="Could not load publications." onRetry={() => refetch()} />}

      {!isLoading && !isError && publications.length === 0 && (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title={search || author || year !== '' || volume || issue ? 'No results found' : 'No publications yet'}
          description={
            search || author || year !== '' || volume || issue
              ? 'Try adjusting filters or search.'
              : 'Check back later for new publications.'
          }
          className="py-16"
        />
      )}

      {!isLoading && !isError && publications.length > 0 && (
        <>
          <div className="space-y-12">
            {groupedSections.map((section: { label: string; items: PublicationListItem[] }) => (
              <section key={section.label}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                    {section.label}
                  </h2>
                  <div className="flex-1 h-px bg-subtle" />
                  <span className="text-xs text-muted font-medium shrink-0">{section.items.length} article{section.items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  {section.items.map((pub: PublicationListItem) => (
                    <PublicationCard key={pub.id} publication={pub} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {meta && total > perPage && (
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
