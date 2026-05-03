/**
 * Notification Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Notification,
  NotificationDraft,
  NotificationUpdatePayload,
  NotificationFilters,
  NotificationsResponse,
} from './types/Notification.types';

// Hooks (primary interface for components)
export { useNotifications } from './hooks/useNotifications';
export { useNotification } from './hooks/useNotification';

// Mutations
export {
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
} from './mutations/notifications.mutations';

// Query options (for prefetching in loaders/server components)
export {
  notificationsListQueryOptions,
  notificationsDetailQueryOptions,
} from './queries/notifications.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { notificationsKeys } from './queries/notifications.keys';
