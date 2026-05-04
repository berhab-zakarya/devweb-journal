'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full h-10 pl-3 pr-9 rounded-md border bg-surface text-sm text-primary font-primary',
          'appearance-none cursor-pointer',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted',
          error
            ? 'border-danger focus:ring-danger focus:border-danger'
            : 'border-subtle focus:ring-brand-500 focus:border-brand-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
        aria-hidden="true"
      />
    </div>
  )
);

Select.displayName = 'Select';
