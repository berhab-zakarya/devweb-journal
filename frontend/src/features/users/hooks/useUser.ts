/**
 * useUser hook
 *
 * Fetches a single user by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { usersDetailQueryOptions } from '../queries/users.queries';

export function useUser(id: string) {
  return useQuery(usersDetailQueryOptions(id));
}
