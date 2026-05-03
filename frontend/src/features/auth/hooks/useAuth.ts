/**
 * useAuth hook
 *
 * Fetches a single auth by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { authDetailQueryOptions } from '../queries/auth.queries';

export function useAuth(id: string) {
  return useQuery(authDetailQueryOptions(id));
}
