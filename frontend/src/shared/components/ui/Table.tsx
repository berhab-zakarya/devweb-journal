import { cn } from '@/shared/utils/cn';

export function TableContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface border border-subtle rounded-lg overflow-hidden', className)}>
      {children}
    </div>
  );
}

export function TableFilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 px-4 py-3 border-b border-subtle bg-muted/50', className)}>
      {children}
    </div>
  );
}

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-subtle bg-muted/30">
        {children}
      </tr>
    </thead>
  );
}

export interface ThProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function Th({ children, className, align = 'left' }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide',
        align === 'left'   && 'text-left',
        align === 'center' && 'text-center',
        align === 'right'  && 'text-right',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-subtle">{children}</tbody>;
}

export interface TrProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Tr({ children, className, onClick }: TrProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'hover:bg-muted/40 transition-colors duration-150',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

export interface TdProps {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function Td({ children, className, align = 'left' }: TdProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-primary',
        align === 'left'   && 'text-left',
        align === 'center' && 'text-center',
        align === 'right'  && 'text-right',
        className
      )}
    >
      {children}
    </td>
  );
}
