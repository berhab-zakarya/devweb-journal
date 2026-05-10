'use client';

import { useState, useRef } from 'react';
import { Search, Loader2, Check } from 'lucide-react';
import type { ReviewerSearchResult } from '../types/Article.types';

interface ReviewerComboboxProps {
  query: string;
  onQueryChange: (v: string) => void;
  results: ReviewerSearchResult[];
  selected: ReviewerSearchResult[];
  onToggle: (r: ReviewerSearchResult) => void;
  loading: boolean;
}

export function ReviewerSearchBox({
  query,
  onQueryChange,
  results,
  selected,
  onToggle,
  loading,
}: Readonly<ReviewerComboboxProps>) {
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(true);
  }

  function handleBlur() {
    // Delay closing so that a click on a dropdown item fires first
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function handleItemMouseDown() {
    // Prevent the input's blur from firing before the item's click
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }

  const showDropdown = open && (loading || results.length > 0);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search reviewers by name or email…"
          className="w-full h-10 pl-9 pr-9 text-sm border border-strong rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-primary"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
        )}
      </div>

      {showDropdown && (
        <ul className="absolute z-10 w-full mt-1 bg-surface border border-subtle rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {loading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">Loading reviewers…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">No reviewers found.</li>
          )}
          {results.map((r) => {
            const isSelected = selected.some((x) => x.id === r.id);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onMouseDown={handleItemMouseDown}
                  onClick={() => onToggle(r)}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700'
                      : 'hover:bg-muted/60 text-primary'
                  }`}
                >
                  <span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted ml-2 text-xs">{r.email}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
