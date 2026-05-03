/**
 * Notification Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { notificationsKeys } from '../queries/notifications.keys';
import type {
  NotificationDraft,
  NotificationUpdatePayload,
} from '../types/Notification.types';

/**
 * Create a new notification.
 */
export function useCreateNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationDraft) => notificationsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
    },
  });
}

/**
 * Update an existing notification.
 */
export function useUpdateNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationUpdatePayload) => notificationsService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.setQueryData(notificationsKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a notification.
 */
export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.removeQueries({ queryKey: notificationsKeys.detail(id) });
    },
  });
}
