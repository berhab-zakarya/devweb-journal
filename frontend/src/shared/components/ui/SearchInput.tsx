'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-9 pl-9 pr-8 rounded-md border border-subtle',
          'bg-surface text-sm text-primary font-primary',
          'placeholder:text-muted',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          'transition-colors duration-150'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
