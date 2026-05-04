'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-danger" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-primary mb-1">{title}</h3>
      {message && <p className="text-sm text-muted mb-4 max-w-sm">{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
