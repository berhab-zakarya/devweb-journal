import type { PublicationFilters } from '../types/Publication.types';

export const publicationsKeys = {
  all: ['publications'] as const,
  lists: () => [...publicationsKeys.all, 'list'] as const,
  list: (filters?: PublicationFilters) => [...publicationsKeys.lists(), { filters }] as const,
  listInfinite: (filters?: Omit<PublicationFilters, 'page'>) =>
    [...publicationsKeys.lists(), 'infinite', { filters }] as const,
  details: () => [...publicationsKeys.all, 'detail'] as const,
  detail: (id: number) => [...publicationsKeys.details(), id] as const,
  volumes: () => [...publicationsKeys.all, 'volumes'] as const,
} as const;
