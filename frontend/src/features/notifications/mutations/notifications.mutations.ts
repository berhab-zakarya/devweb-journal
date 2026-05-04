'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { notificationsKeys } from '../queries/notifications.keys';

export function useMarkReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.lists() });
      qc.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
}

export function useMarkAllReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationsKeys.lists() });
      qc.invalidateQueries({ queryKey: notificationsKeys.unreadCount() });
    },
  });
}
