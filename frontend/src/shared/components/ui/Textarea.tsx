'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5 rounded-md border bg-surface text-sm text-primary font-primary',
        'placeholder:text-muted resize-y min-h-[100px]',
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

Textarea.displayName = 'Textarea';
