import { queryOptions } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { authKeys } from './auth.keys';

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.me(),
    queryFn:  authService.me,
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
