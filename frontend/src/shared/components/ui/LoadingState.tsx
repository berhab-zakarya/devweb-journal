import { cn } from '@/shared/utils/cn';

export interface LoadingStateProps {
  rows?: number;
  className?: string;
  variant?: 'card' | 'table' | 'list';
}

export function LoadingState({ rows = 3, className, variant = 'card' }: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div className={cn('animate-pulse space-y-0', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-subtle">
            <div className="h-4 bg-muted rounded flex-1" />
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('animate-pulse space-y-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start p-4 border border-subtle rounded-lg">
            <div className="w-8 h-8 bg-muted rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-surface border border-subtle rounded-lg p-5 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <div className={cn('h-4 bg-muted rounded animate-pulse', className)} />;
}
