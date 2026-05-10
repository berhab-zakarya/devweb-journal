'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogoutMutation } from '@/features/auth/mutations/auth.mutations';
import { Button } from '@/shared/components/ui/Button';

export function PublicHeader() {
  const router = useRouter();
  const { data: currentUser, isLoading: isAuthLoading } = useCurrentUser();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/login');
  };

  return (
    <header className="bg-surface border-b border-subtle sticky top-0 z-30 shadow-[0_1px_0_0_rgb(226_232_240/0.6)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg font-bold text-primary font-primary group-hover:text-brand-600 transition-colors">
            DevWeb Journal
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted bg-muted px-2 py-0.5 rounded-full border border-subtle">
            Academic Journal
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/journal" className="text-secondary hover:text-primary transition-colors">
            Journal
          </Link>

          {/* Loading state - show skeleton button */}
          {isAuthLoading && (
            <div className="px-3 py-1.5 rounded bg-muted animate-pulse" style={{ width: '80px', height: '24px' }} />
          )}

          {/* Authenticated user view */}
          {!isAuthLoading && currentUser && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted text-primary text-xs font-medium">
                <span className="truncate max-w-30">{currentUser.name}</span>
              </div>
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                loading={logoutMutation.isPending}
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </>
          )}

          {/* Unauthenticated user view */}
          {!isAuthLoading && !currentUser && (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
