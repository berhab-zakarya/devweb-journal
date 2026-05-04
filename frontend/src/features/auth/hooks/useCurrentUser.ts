import { useQuery } from '@tanstack/react-query';
import { currentUserQueryOptions } from '../queries/auth.queries';

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions());
}
