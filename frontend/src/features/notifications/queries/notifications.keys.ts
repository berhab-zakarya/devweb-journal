import type { NotificationFilters } from '../types/Notification.types';

export const notificationsKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationsKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) => [...notificationsKeys.lists(), { filters }] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
} as const;
