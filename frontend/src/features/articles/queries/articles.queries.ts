/**
 * Article Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';
import { articlesKeys } from './articles.keys';
import type { ArticleFilters } from '../types/Article.types';

/**
 * Query options for fetching a paginated list of articles.
 */
export const articlesListQueryOptions = (filters?: ArticleFilters) =>
  queryOptions({
    queryKey: articlesKeys.list(filters),
    queryFn: () => articlesService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single article by ID.
 */
export const articlesDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: articlesKeys.detail(id),
    queryFn: () => articlesService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
