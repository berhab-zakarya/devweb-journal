/**
 * Publication Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { publicationsService } from '../services/publications.service';
import { publicationsKeys } from './publications.keys';
import type { PublicationFilters } from '../types/Publication.types';

/**
 * Query options for fetching a paginated list of publications.
 */
export const publicationsListQueryOptions = (filters?: PublicationFilters) =>
  queryOptions({
    queryKey: publicationsKeys.list(filters),
    queryFn: () => publicationsService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single publication by ID.
 */
export const publicationsDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: publicationsKeys.detail(id),
    queryFn: () => publicationsService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
