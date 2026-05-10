'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import type { DashboardItem } from '../types/Dashboard.types';
import { normalizeDashboardRoute } from '../utils/dashboardRoutes';

export function PendingWorkSection({ items }: Readonly<{ items: DashboardItem[] }>) {
  if (!items.length) return null;

  return (
    <section aria-label="Pending work">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-brand-500 shrink-0" aria-hidden />
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">In Progress</h2>
        <span className="text-xs font-medium text-brand-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
          {items.reduce((s, i) => s + i.count, 0)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.key}
            href={normalizeDashboardRoute(item.route)}
            className="group relative bg-surface border border-subtle rounded-xl p-5 flex flex-col gap-3 hover:border-brand-500/50 hover:shadow-panel transition-all duration-150 stat-card-pending"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{item.label}</p>
              <p className="text-3xl font-bold text-primary tabular-nums">{item.count}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:gap-1.5 transition-all">
              <span>View items</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
