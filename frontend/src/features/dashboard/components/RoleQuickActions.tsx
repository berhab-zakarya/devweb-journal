'use client';

import Link from 'next/link';
import { BookOpen, FolderTree, LayoutGrid, Users } from 'lucide-react';
import type { DashboardSummary } from '../types/Dashboard.types';
import { cn } from '@/shared/utils/cn';

const quickLinkClass = cn(
  'inline-flex items-center justify-center gap-2 rounded font-primary font-medium transition-colors duration-150',
  'h-9 px-3 py-1.5 text-sm',
  'bg-surface text-secondary border border-strong hover:bg-muted',
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1'
);

function isElevated(roles: string[]) {
  return roles.some((r) => r === 'admin' || r === 'editor');
}

export function RoleQuickActions({
  summaryRole,
  userRoles,
}: Readonly<{
  summaryRole: DashboardSummary['role'];
  userRoles: string[];
}>) {
  const elevated = isElevated(userRoles);
  const effectiveAdmin = summaryRole === 'admin' || userRoles.includes('admin');
  const effectiveStaff = elevated || summaryRole === 'editor';

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {(effectiveAdmin || effectiveStaff) && (
        <Link href="/publications" className={quickLinkClass}>
          <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden />
          Publication queue
        </Link>
      )}
      {effectiveAdmin && (
        <>
          <Link href="/users" className={quickLinkClass}>
            <Users className="w-4 h-4 shrink-0" aria-hidden />
            User management
          </Link>
          <Link href="/categories" className={quickLinkClass}>
            <FolderTree className="w-4 h-4 shrink-0" aria-hidden />
            Journals &amp; categories
          </Link>
        </>
      )}
      {(summaryRole === 'reader' || userRoles.includes('reader')) && (
        <Link href="/journal" className={quickLinkClass}>
          <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
          Public journal
        </Link>
      )}
      {(summaryRole === 'author' || userRoles.includes('author')) && !effectiveAdmin && (
        <Link href="/articles/new" className={quickLinkClass}>
          <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
          Submit article
        </Link>
      )}
    </div>
  );
}
