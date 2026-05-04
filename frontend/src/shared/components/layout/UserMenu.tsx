'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface CurrentUser {
  id: number | string;
  name: string;
  email: string;
  roles: string[];
}

export interface UserMenuProps {
  user: CurrentUser;
  onLogout?: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const primaryRole = user.roles?.[0] ?? 'reader';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted transition-colors duration-150"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-brand-700">{initials}</span>
        </div>
        <div className="text-left hidden sm:block min-w-0">
          <p className="text-sm font-medium text-primary leading-none truncate max-w-[120px]">
            {user.name}
          </p>
          <p className="text-xs text-muted mt-0.5 capitalize">{primaryRole}</p>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 text-muted transition-transform duration-150 hidden sm:block', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full mt-1.5 w-48 bg-surface border border-subtle rounded-lg shadow-panel',
            'py-1 z-50'
          )}
        >
          <div className="px-3 py-2 border-b border-subtle mb-1">
            <p className="text-xs font-semibold text-primary truncate">{user.name}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>

          <MenuItem href="/profile" icon={<User className="w-4 h-4" />} onClick={() => setOpen(false)}>
            Profile
          </MenuItem>
          <MenuItem href="/settings" icon={<Settings className="w-4 h-4" />} onClick={() => setOpen(false)}>
            Settings
          </MenuItem>

          <div className="border-t border-subtle mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onLogout?.(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-secondary hover:bg-muted hover:text-primary transition-colors"
    >
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      {children}
    </Link>
  );
}
