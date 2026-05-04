import { queryOptions } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { usersKeys } from './users.keys';
import type { UserFilters } from '../types/User.types';

export const usersListQueryOptions = (filters?: UserFilters) =>
  queryOptions({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersService.getAll(filters),
    staleTime: 60_000,
  });
