/**
 * useCategory hook
 *
 * Fetches a single category by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { categoriesDetailQueryOptions } from '../queries/categories.queries';

export function useCategory(id: string) {
  return useQuery(categoriesDetailQueryOptions(id));
}
