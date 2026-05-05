import { useInfiniteQuery } from '@tanstack/react-query';
import { publicationsService } from '../services/publications.service';
import { publicationsKeys } from '../queries/publications.keys';
import type { PublicationFilters } from '../types/Publication.types';

export function usePublicationsInfinite(filters?: Omit<PublicationFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: publicationsKeys.listInfinite(filters),
    queryFn: ({ pageParam }) =>
      publicationsService.getAll({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.data.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 5 * 60_000,
  });
}
