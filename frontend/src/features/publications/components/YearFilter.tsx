'use client';

import type { ChangeEvent } from 'react';
import { FormField, Select } from '@/shared/components/ui';

export function YearFilter({
  value,
  yearOptions,
  onChange,
}: Readonly<{
  value: number | '';
  yearOptions: number[];
  onChange: (year: number | '') => void;
}>) {
  return (
    <FormField id="filter-year" label="Year">
      <Select
        id="filter-year"
        value={value === '' ? '' : String(value)}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const v = e.target.value;
          onChange(v === '' ? '' : Number(v));
        }}
      >
        <option value="">All years</option>
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
