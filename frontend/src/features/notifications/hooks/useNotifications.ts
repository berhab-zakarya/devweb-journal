import { useQuery } from '@tanstack/react-query';
import { notificationsListQueryOptions } from '../queries/notifications.queries';
import type { NotificationFilters } from '../types/Notification.types';

export function useNotifications(filters?: NotificationFilters) {
  return useQuery(notificationsListQueryOptions(filters));
}
