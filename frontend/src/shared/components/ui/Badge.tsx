import { cn } from '@/shared/utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  pill?: boolean;
}

export function Badge({ children, className, pill = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-semibold',
        pill ? 'rounded-full' : 'rounded',
        className
      )}
    >
      {children}
    </span>
  );
}
