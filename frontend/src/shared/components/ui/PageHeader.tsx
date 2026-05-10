import { cn } from '@/shared/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-8',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-primary leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0 w-full md:w-auto">{action}</div>
      )}
    </div>
  );
}
