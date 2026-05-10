'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import type { DashboardItem } from '../types/Dashboard.types';
import { normalizeDashboardRoute } from '../utils/dashboardRoutes';

export function RequiresAttentionSection({ items }: Readonly<{ items: DashboardItem[] }>) {
  if (!items.length) return null;

  return (
    <section aria-label="Requires attention">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-4 h-4 text-warning shrink-0" aria-hidden />
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Requires Attention</h2>
        <span className="text-xs font-medium text-warning bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          {items.reduce((s, i) => s + i.count, 0)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.key}
            href={normalizeDashboardRoute(item.route)}
            className="group relative bg-surface border border-subtle rounded-xl p-5 flex flex-col gap-3 hover:border-warning/50 hover:shadow-panel transition-all duration-150 stat-card-attention"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{item.label}</p>
              <p className="text-3xl font-bold text-primary tabular-nums">{item.count}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-warning group-hover:gap-1.5 transition-all">
              <span>View items</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
