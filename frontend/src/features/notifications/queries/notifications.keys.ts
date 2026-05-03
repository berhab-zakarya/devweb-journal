/**
 * Notification Query Keys
 *
 * Centralized, typed query key factory for TanStack Query.
 * All notifications queries/mutations reference keys from here.
 */

import type { NotificationFilters } from '../types/Notification.types';

export const notificationsKeys = {
  /** Base key for all notifications queries */
  all: ['notifications'] as const,

  /** All list variants */
  lists: () => [...notificationsKeys.all, 'list'] as const,

  /** Specific list with filters */
  list: (filters?: NotificationFilters) =>
    [...notificationsKeys.lists(), { filters }] as const,

  /** All detail variants */
  details: () => [...notificationsKeys.all, 'detail'] as const,

  /** Single item detail */
  detail: (id: string) => [...notificationsKeys.details(), id] as const,
} as const;
