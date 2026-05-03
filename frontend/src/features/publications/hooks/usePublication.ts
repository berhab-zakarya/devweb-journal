/**
 * usePublication hook
 *
 * Fetches a single publication by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { publicationsDetailQueryOptions } from '../queries/publications.queries';

export function usePublication(id: string) {
  return useQuery(publicationsDetailQueryOptions(id));
}
