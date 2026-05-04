import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

export interface PublicShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PublicShell({ children, className }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <PublicHeader />
      <main className={cn('flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10', className)}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="bg-surface border-b border-subtle sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary font-primary hover:text-brand-600 transition-colors">
          DevWeb Journal
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/journal" className="text-secondary hover:text-primary transition-colors">
            Journal
          </Link>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded bg-brand-600 text-inverse text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-subtle bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} DevWeb Journal. Academic Journal Editorial System.
      </div>
    </footer>
  );
}
