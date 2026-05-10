'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { LoadingState, ErrorState, Card } from '@/shared/components/ui';
import { publicationsVolumesQueryOptions } from '../queries/publications.queries';
import type { Volume } from '../types/Publication.types';

export function PublicationsVolumesBrowsePage() {
  const q = useQuery(publicationsVolumesQueryOptions());

  if (q.isLoading) return <LoadingState rows={6} />;
  if (q.isError) return <ErrorState message="Could not load volumes." onRetry={() => q.refetch()} />;

  const rows = (q.data ?? []) as Volume[];

  return (
    <div className="w-full min-w-0">
      <Link href="/journal" className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to journal
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Volumes &amp; issues</h1>
        <p className="text-sm text-muted mt-1">Distinct publication volumes available for filtering</p>
      </div>
      <Card padding="none">
        <ul className="divide-y divide-subtle">
          {rows.map((v, i) => (
            <li key={`${v.year}-${v.volume}-${v.issue}-${i}`} className="px-5 py-3 flex justify-between text-sm">
              <span className="text-primary font-medium">
                {v.year ? `${v.year}` : '—'} · Vol. {v.volume ?? '—'} · Issue {v.issue ?? '—'}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
