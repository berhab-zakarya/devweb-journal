'use client';

import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search } from 'lucide-react';
import {
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
  Pagination,
  Card,
  Input,
  Select,
  FormField,
} from '@/shared/components/ui';
import { usePublications } from '../hooks/usePublications';
import { publicationsVolumesQueryOptions } from '../queries/publications.queries';
import type { PublicationListItem, Volume } from '../types/Publication.types';

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
  const [page, setPage] = useState(1);

  const { data: volumes = [] } = useQuery(publicationsVolumesQueryOptions());

  const yearOptions = useMemo(() => {
    const ys = new Set<number>();
    for (const v of volumes as Volume[]) {
      if (typeof v.year === 'number' && v.year > 0) {
        ys.add(v.year);
      }
    }
    return Array.from(ys).sort((a, b) => b - a);
  }, [volumes]);

  const volumeOptionsForYear = useMemo(() => {
    const vols = volumes as Volume[];
    if (year === '') {
      return Array.from(new Set(vols.map((v) => v.volume).filter(Boolean))) as string[];
    }
    return Array.from(
      new Set(
        vols.filter((v) => v.year === year).map((v) => v.volume).filter(Boolean)
      )
    ) as string[];
  }, [volumes, year]);

  const { data, isLoading, isError, refetch } = usePublications({
    search: search || undefined,
    author: author.trim() || undefined,
    year: year === '' ? undefined : year,
    volume: volume || undefined,
    page,
  });

  const publications = data?.data?.data ?? [];
  const total = data?.data?.meta?.total ?? 0;
  const lastPage = data?.data?.meta?.last_page ?? 1;
  const perPage = data?.data?.meta?.per_page ?? 12;

  const groupedSections = useMemo(() => groupByYearAndVolume(publications), [publications]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-50 mb-4">
          <BookOpen className="w-7 h-7 text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold text-primary">DevWeb Journal</h1>
        <p className="text-base text-muted mt-2">Browse peer-reviewed articles published by our editorial team</p>
      </div>

      <div className="mb-8 space-y-4 max-w-2xl mx-auto">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search title, abstract, keywords, or author…"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FormField id="filter-author" label="Author name">
            <Input
              id="filter-author"
              value={author}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setAuthor(e.target.value); setPage(1); }}
              placeholder="Filter by author"
            />
          </FormField>
          <FormField id="filter-year" label="Year">
            <Select
              id="filter-year"
              value={year === '' ? '' : String(year)}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const v = e.target.value;
                setYear(v === '' ? '' : Number(v));
                setVolume('');
                setPage(1);
              }}
            >
              <option value="">All years</option>
              {yearOptions.map((y: number) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </FormField>
          <FormField id="filter-volume" label="Volume">
            <Select
              id="filter-volume"
              value={volume}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => { setVolume(e.target.value); setPage(1); }}
            >
              <option value="">All volumes</option>
              {volumeOptionsForYear.map((vol: string) => (
                <option key={vol} value={vol}>{vol}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </div>

      {isLoading && <LoadingState variant="list" rows={5} />}

      {isError && (
        <ErrorState message="Could not load publications." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && publications.length === 0 && (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title={search || author || year !== '' || volume ? 'No results found' : 'No publications yet'}
          description={search || author || year !== '' || volume ? 'Try adjusting filters or search.' : 'Check back later for new publications.'}
          className="py-16"
        />
      )}

      {!isLoading && !isError && publications.length > 0 && (
        <>
          <div className="space-y-10">
            {groupedSections.map((section: { label: string; items: PublicationListItem[] }) => (
              <section key={section.label}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3 border-b border-subtle pb-2">
                  {section.label}
                </h2>
                <div className="space-y-4">
                  {section.items.map((pub: PublicationListItem) => (
                    <Card key={pub.id} className="hover:shadow-panel transition-shadow duration-150">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/journal/${pub.id}`}
                            className="text-lg font-semibold text-primary hover:text-brand-600 transition-colors leading-snug"
                          >
                            {pub.title ?? `Publication #${pub.id}`}
                          </Link>

                          {pub.author_name && (
                            <p className="text-sm text-secondary mt-1">
                              {pub.author_name}
                            </p>
                          )}

                          {pub.abstract && (
                            <p className="text-sm text-secondary mt-2 line-clamp-2">
                              {pub.abstract}
                            </p>
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
              </section>
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
