import { useQuery } from '@tanstack/react-query';
import { publicationsListQueryOptions } from '../queries/publications.queries';
import type { PublicationFilters } from '../types/Publication.types';

export function usePublications(filters?: PublicationFilters) {
  return useQuery(publicationsListQueryOptions(filters));
}
