import { queryOptions } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { notificationsKeys } from './notifications.keys';
import type { NotificationFilters } from '../types/Notification.types';

export const notificationsListQueryOptions = (filters?: NotificationFilters) =>
  queryOptions({
    queryKey: notificationsKeys.list(filters),
    queryFn: () => notificationsService.getAll(filters),
    staleTime: 30_000,
  });

export const notificationsUnreadCountQueryOptions = () =>
  queryOptions({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 30_000,
  });
