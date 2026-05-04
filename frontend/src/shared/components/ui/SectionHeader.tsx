import { cn } from '@/shared/utils/cn';

export interface SectionHeaderProps {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, count, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-2 mb-4', className)}>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        {typeof count !== 'undefined' && (
          <span className="text-xs text-muted">({count})</span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
