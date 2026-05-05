'use client';

import type { ChangeEvent } from 'react';
import { FormField, Select } from '@/shared/components/ui';

export function VolumeIssueFilter({
  volume,
  issue,
  volumeOptions,
  issueOptions,
  onVolumeChange,
  onIssueChange,
}: Readonly<{
  volume: string;
  issue: string;
  volumeOptions: string[];
  issueOptions: string[];
  onVolumeChange: (v: string) => void;
  onIssueChange: (v: string) => void;
}>) {
  return (
    <>
      <FormField id="filter-volume" label="Volume">
        <Select
          id="filter-volume"
          value={volume}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onVolumeChange(e.target.value)}
        >
          <option value="">All volumes</option>
          {volumeOptions.map((vol) => (
            <option key={vol} value={vol}>
              {vol}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="filter-issue" label="Issue">
        <Select
          id="filter-issue"
          value={issue}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onIssueChange(e.target.value)}
        >
          <option value="">All issues</option>
          {issueOptions.map((iss) => (
            <option key={iss} value={iss}>
              {iss}
            </option>
          ))}
        </Select>
      </FormField>
    </>
  );
}
