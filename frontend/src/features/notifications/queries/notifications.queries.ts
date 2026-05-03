/**
 * Notification Query Options
 *
 * TanStack Query queryOptions factories.
 * Compose these inside hooks — never call useQuery directly in components.
 */

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { notificationsKeys } from './notifications.keys';
import type { NotificationFilters } from '../types/Notification.types';

/**
 * Query options for fetching a paginated list of notifications.
 */
export const notificationsListQueryOptions = (filters?: NotificationFilters) =>
  queryOptions({
    queryKey: notificationsKeys.list(filters),
    queryFn: () => notificationsService.getAll(filters),
    staleTime: 60_000,
  });

/**
 * Query options for fetching a single notification by ID.
 */
export const notificationsDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: notificationsKeys.detail(id),
    queryFn: () => notificationsService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
