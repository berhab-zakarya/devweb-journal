import { queryOptions } from '@tanstack/react-query';
import { publicationsService } from '../services/publications.service';
import { publicationsKeys } from './publications.keys';
import type { PublicationFilters } from '../types/Publication.types';

export const publicationsListQueryOptions = (filters?: PublicationFilters) =>
  queryOptions({
    queryKey: publicationsKeys.list(filters),
    queryFn: () => publicationsService.getAll(filters),
    staleTime: 5 * 60_000,
  });

export const publicationsDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: publicationsKeys.detail(id),
    queryFn: () => publicationsService.getById(id),
    enabled: id > 0,
    staleTime: 5 * 60_000,
  });

export const publicationsVolumesQueryOptions = () =>
  queryOptions({
    queryKey: publicationsKeys.volumes(),
    queryFn: () => publicationsService.getVolumes(),
    staleTime: 10 * 60_000,
  });
