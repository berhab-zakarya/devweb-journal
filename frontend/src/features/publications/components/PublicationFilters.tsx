'use client';

import type { ChangeEvent } from 'react';
import { SearchInput, FormField, Input } from '@/shared/components/ui';
import { YearFilter } from './YearFilter';
import { VolumeIssueFilter } from './VolumeIssueFilter';

export function PublicationFilters({
  search,
  author,
  year,
  yearOptions,
  volume,
  issue,
  volumeOptions,
  issueOptions,
  onSearchChange,
  onAuthorChange,
  onYearChange,
  onVolumeChange,
  onIssueChange,
}: Readonly<{
  search: string;
  author: string;
  year: number | '';
  yearOptions: number[];
  volume: string;
  issue: string;
  volumeOptions: string[];
  issueOptions: string[];
  onSearchChange: (v: string) => void;
  onAuthorChange: (v: string) => void;
  onYearChange: (y: number | '') => void;
  onVolumeChange: (v: string) => void;
  onIssueChange: (v: string) => void;
}>) {
  return (
    <div className="mb-8 space-y-4 max-w-2xl mx-auto">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search title, abstract, keywords, or author…"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <FormField id="filter-author" label="Author name">
          <Input
            id="filter-author"
            value={author}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onAuthorChange(e.target.value)}
            placeholder="Filter by author"
          />
        </FormField>
        <YearFilter value={year} yearOptions={yearOptions} onChange={onYearChange} />
        <VolumeIssueFilter
          volume={volume}
          issue={issue}
          volumeOptions={volumeOptions}
          issueOptions={issueOptions}
          onVolumeChange={onVolumeChange}
          onIssueChange={onIssueChange}
        />
      </div>
    </div>
  );
}
