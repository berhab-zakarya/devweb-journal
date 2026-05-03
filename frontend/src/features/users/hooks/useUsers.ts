/**
 * useUsers hook
 *
 * Composes query options + useQuery for listing users.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { usersListQueryOptions } from '../queries/users.queries';
import type { UserFilters } from '../types/User.types';

export function useUsers(filters?: UserFilters) {
  return useQuery(usersListQueryOptions(filters));
}
