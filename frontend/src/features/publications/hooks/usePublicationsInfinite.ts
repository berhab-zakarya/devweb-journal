import { useInfiniteQuery } from '@tanstack/react-query';
import { publicationsService } from '../services/publications.service';
import { publicationsKeys } from '../queries/publications.keys';
import type { PublicationFilters } from '../types/Publication.types';

export function usePublicationsInfinite(filters?: Omit<PublicationFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: publicationsKeys.listInfinite(filters),
    queryFn: ({ pageParam }) =>
      publicationsService.getAll({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const currentPage = last.meta?.current_page;
      const lastPage = last.meta?.last_page;
      if (!currentPage || !lastPage) return undefined;
      return currentPage < lastPage ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60_000,
  });
}
