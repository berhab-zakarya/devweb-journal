'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:     'bg-brand-600 text-inverse hover:bg-brand-700 font-semibold',
  secondary:   'bg-surface text-secondary border border-strong hover:bg-muted',
  ghost:       'bg-transparent text-secondary hover:bg-muted',
  destructive: 'bg-danger text-inverse hover:bg-red-700 font-semibold',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9  px-3   py-1.5 text-sm',
  md: 'h-10 px-4   py-2   text-sm',
  lg: 'h-11 px-5   py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-primary font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        loading && 'cursor-wait',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0 flex items-center" aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="shrink-0 flex items-center" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  )
);

Button.displayName = 'Button';
