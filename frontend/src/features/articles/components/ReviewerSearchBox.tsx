'use client';

import { Button } from '@/shared/components/ui';

export function ReviewerSearchBox({
  value,
  onChange,
  onSearch,
  searching,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  searching: boolean;
}>) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onSearch())}
        placeholder="Search reviewers by name or email…"
        className="flex-1 h-10 px-3 text-sm border border-strong rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-primary"
      />
      <Button type="button" variant="secondary" size="sm" onClick={onSearch} loading={searching}>
        Search
      </Button>
    </div>
  );
}
