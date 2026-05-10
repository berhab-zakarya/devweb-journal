import { cn } from '@/shared/utils/cn';
import { PublicHeader } from './PublicHeader';

export interface PublicShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PublicShell({ children, className }: Readonly<PublicShellProps>) {
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <PublicHeader />
      <main className={cn('flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10', className)}>
        <div className="w-full min-w-0">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-subtle bg-surface mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <span className="font-medium text-primary text-sm">DevWeb Journal</span>
        <span>© {new Date().getFullYear()} Academic Journal Editorial System</span>
      </div>
    </footer>
  );
}
