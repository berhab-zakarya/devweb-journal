'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsUnreadCountQueryOptions } from '../queries/notifications.queries';

export function useNotificationsUnreadCount(enabled = true) {
  return useQuery({
    ...notificationsUnreadCountQueryOptions(),
    enabled,
  });
}
