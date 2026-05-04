import { cn } from '@/shared/utils/cn';

export interface AuthShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <div className={cn('w-full max-w-md', className)}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary font-primary">DevWeb Journal</h1>
          <p className="text-sm text-muted mt-1">Academic Journal Editorial System</p>
        </div>
        <div className="bg-surface border border-subtle rounded-xl p-6 md:p-8 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
