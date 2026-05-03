/**
 * useAuths hook
 *
 * Composes query options + useQuery for listing auths.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { authListQueryOptions } from '../queries/auth.queries';
import type { AuthFilters } from '../types/Auth.types';

export function useAuths(filters?: AuthFilters) {
  return useQuery(authListQueryOptions(filters));
}
