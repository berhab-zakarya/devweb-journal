'use client';

import Link from 'next/link';
import { BookOpen, FolderTree, LayoutGrid, Users } from 'lucide-react';
import { getPrimaryRole, getVisibleQuickActions } from '../utils/roleHelpers';

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-4 h-4 shrink-0" aria-hidden />,
  FolderTree: <FolderTree className="w-4 h-4 shrink-0" aria-hidden />,
  LayoutGrid: <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden />,
  BookOpen: <BookOpen className="w-4 h-4 shrink-0" aria-hidden />,
};

export function RoleQuickActions({
  userRoles,
}: Readonly<{
  userRoles: string[];
}>) {
  const primaryRole = getPrimaryRole(userRoles);
  const visibleActions = getVisibleQuickActions(primaryRole, userRoles);

  const quickLinkClass =
    'inline-flex items-center justify-center gap-2 rounded font-primary font-medium transition-colors duration-150 ' +
    'h-9 px-3 py-1.5 text-sm ' +
    'bg-surface text-secondary border border-strong hover:bg-muted ' +
    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1';

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {visibleActions.map((action) => {
        return (
          <Link key={action.id} href={action.href} className={quickLinkClass}>
            {iconMap[action.icon]}
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
