'use client';

import { Plus } from 'lucide-react';
import type { ReviewerSearchResult } from '../types/Article.types';

export function SelectedReviewersList({
  selected,
  onToggle,
  searchResults,
}: Readonly<{
  selected: ReviewerSearchResult[];
  onToggle: (r: ReviewerSearchResult) => void;
  searchResults: ReviewerSearchResult[];
}>) {
  return (
    <>
      {searchResults.length > 0 && (
        <ul className="border border-subtle rounded-lg divide-y divide-subtle max-h-48 overflow-y-auto">
          {searchResults.map((r) => {
            const isSelected = selected.some((x) => x.id === r.id);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onToggle(r)}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-brand-50 text-brand-700' : 'hover:bg-muted text-primary'
                  }`}
                >
                  <span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted ml-2">{r.email}</span>
                  </span>
                  {isSelected && <Plus className="w-4 h-4 rotate-45 shrink-0" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected.length > 0 && (
        <p className="text-sm text-secondary">
          Selected: {selected.map((r) => r.name).join(', ')}
        </p>
      )}
    </>
  );
}
