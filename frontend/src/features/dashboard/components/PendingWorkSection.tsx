'use client';

import Link from 'next/link';
import type { DashboardItem } from '../types/Dashboard.types';
import { normalizeDashboardRoute } from '../utils/dashboardRoutes';

export function PendingWorkSection({ items }: Readonly<{ items: DashboardItem[] }>) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Pending</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.key}
            href={normalizeDashboardRoute(item.route)}
            className="bg-surface border border-subtle rounded-lg p-5 shadow-card hover:shadow-panel transition-shadow duration-150 block"
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-secondary">{item.label}</p>
            <p className="text-3xl font-bold text-primary">{item.count}</p>
            <span className="text-xs text-brand-600 hover:underline mt-1 inline-block">View →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
