'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3 rounded-md border bg-surface text-sm text-primary font-primary',
        'placeholder:text-muted',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted',
        error
          ? 'border-danger focus:ring-danger focus:border-danger'
          : 'border-subtle focus:ring-brand-500 focus:border-brand-500',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
