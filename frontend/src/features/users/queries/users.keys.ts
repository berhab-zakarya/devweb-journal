import type { UserFilters } from '../types/User.types';

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...usersKeys.lists(), { filters }] as const,
} as const;
