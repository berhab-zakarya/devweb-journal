/**
 * useNotifications hook
 *
 * Composes query options + useQuery for listing notifications.
 * This is what components import — never useQuery directly.
 */

import { useQuery } from '@tanstack/react-query';
import { notificationsListQueryOptions } from '../queries/notifications.queries';
import type { NotificationFilters } from '../types/Notification.types';

export function useNotifications(filters?: NotificationFilters) {
  return useQuery(notificationsListQueryOptions(filters));
}
