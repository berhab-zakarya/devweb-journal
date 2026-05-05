import { useInfiniteQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';
import { articlesKeys } from '../queries/articles.keys';
import type { ArticleFilters } from '../types/Article.types';

export function useArticlesInfinite(filters?: Omit<ArticleFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: articlesKeys.listInfinite(filters),
    queryFn: ({ pageParam }) =>
      articlesService.getAll({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.data.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 60_000,
  });
}
