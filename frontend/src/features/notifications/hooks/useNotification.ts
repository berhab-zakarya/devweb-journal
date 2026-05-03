/**
 * useNotification hook
 *
 * Fetches a single notification by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { notificationsDetailQueryOptions } from '../queries/notifications.queries';

export function useNotification(id: string) {
  return useQuery(notificationsDetailQueryOptions(id));
}
