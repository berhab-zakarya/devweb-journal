import { queryOptions } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import { categoriesKeys } from './categories.keys';

export const categoriesListQueryOptions = () =>
  queryOptions({
    queryKey: categoriesKeys.list(),
    queryFn: () => categoriesService.getList(),
    staleTime: 5 * 60_000,
  });
