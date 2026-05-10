'use client';

import { X } from 'lucide-react';
import type { ReviewerSearchResult } from '../types/Article.types';

export function SelectedReviewersList({
  selected,
  onToggle,
}: Readonly<{
  selected: ReviewerSearchResult[];
  onToggle: (r: ReviewerSearchResult) => void;
}>) {
  if (selected.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {selected.map((r) => (
        <span
          key={r.id}
          className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700"
        >
          {r.name}
          <button
            type="button"
            onClick={() => onToggle(r)}
            className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-brand-200 transition-colors"
            aria-label={`Remove ${r.name}`}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
