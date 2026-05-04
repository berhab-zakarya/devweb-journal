'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface PaginationProps {
  page: number;
  lastPage: number;
  from?: number;
  to?: number;
  total?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  lastPage,
  from,
  to,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <div className={cn('flex items-center justify-between text-sm px-4 py-3', className)}>
      {typeof from !== 'undefined' && typeof to !== 'undefined' && typeof total !== 'undefined' ? (
        <span className="text-muted">
          Showing {from}–{to} of {total}
        </span>
      ) : (
        <span className="text-muted">Page {page} of {lastPage}</span>
      )}

      <div className="flex items-center gap-1">
        <PageButton
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </PageButton>
        <PageButton
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  disabled,
  onClick,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'w-8 h-8 inline-flex items-center justify-center rounded border border-subtle text-secondary',
        'transition-colors duration-150',
        'hover:bg-muted hover:text-primary',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent'
      )}
    >
      {children}
    </button>
  );
}
