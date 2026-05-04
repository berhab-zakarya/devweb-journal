'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

export interface NavigationItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  exact?: boolean;
}

export function NavigationItem({ href, label, icon, onClick, exact = false }: NavigationItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
        isActive
          ? 'bg-brand-600 text-inverse'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="w-5 h-5 shrink-0 flex items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
