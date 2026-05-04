import { useQuery } from '@tanstack/react-query';
import { categoriesListQueryOptions } from '../queries/categories.queries';

export function useCategories() {
  return useQuery(categoriesListQueryOptions());
}
