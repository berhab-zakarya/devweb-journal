/**
 * useCategories hook
 *
 * Composes query options + useQuery for listing categories.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { categoriesListQueryOptions } from '../queries/categories.queries';
import type { CategoryFilters } from '../types/Category.types';

export function useCategories(filters?: CategoryFilters) {
  return useQuery(categoriesListQueryOptions(filters));
}
