import { useInfiniteQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';
import { articlesKeys } from '../queries/articles.keys';
import type { ArticleFilters } from '../types/Article.types';

export function useArticlesInfinite(filters?: Omit<ArticleFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: articlesKeys.listInfinite(filters),
    queryFn: ({ pageParam }) =>
      articlesService.getAll({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const currentPage = last.meta?.current_page;
      const lastPage = last.meta?.last_page;
      if (!currentPage || !lastPage) return undefined;
      return currentPage < lastPage ? currentPage + 1 : undefined;
    },
    staleTime: 60_000,
  });
}
