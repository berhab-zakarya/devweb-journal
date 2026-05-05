'use client';

import Link from 'next/link';
import type { DashboardSummary } from '../types/Dashboard.types';
import { normalizeDashboardRoute } from '../utils/dashboardRoutes';

/** Compact summary strip reusing the same counters as the main sections. */
export function WorkflowStatusCards({ data }: Readonly<{ data: DashboardSummary }>) {
  const all = [...data.requires_attention, ...data.pending, ...data.completed].filter((i) => i.count > 0);
  if (!all.length) return null;
  const top = all.slice(0, 6);
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {top.map((item) => (
        <Link
          key={`wf-${item.key}`}
          href={normalizeDashboardRoute(item.route)}
          className="inline-flex items-center gap-2 rounded-full border border-subtle bg-muted/30 px-3 py-1.5 text-xs font-medium text-secondary hover:bg-muted/60 transition-colors"
        >
          <span className="text-primary font-semibold">{item.count}</span>
          <span className="truncate max-w-[10rem]">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
