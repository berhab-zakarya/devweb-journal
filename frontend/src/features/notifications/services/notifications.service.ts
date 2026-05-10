import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import { normalizeLaravelPaginator, unwrapData } from '@/shared/api/response';
import type {
  Notification,
  PaginatedNotifications,
  NotificationFilters,
} from '../types/Notification.types';

const BASE = ENDPOINTS.NOTIFICATIONS_BASE;

export const notificationsService = {
  getAll: async (filters?: NotificationFilters): Promise<PaginatedNotifications> => {
    const response = await apiClient.get(BASE, { params: filters });
    return normalizeLaravelPaginator<Notification>(response);
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get(`${BASE}/unread-count`);
    const normalized = unwrapData<{ unread_count?: number }>({ data });
    if (typeof normalized?.unread_count === 'number') {
      return normalized.unread_count;
    }
    if (typeof (data as { unread_count?: number }).unread_count === 'number') {
      return (data as { unread_count: number }).unread_count;
    }
    return 0;
  },

  markRead: async (id: number): Promise<Notification> => {
    const { data } = await apiClient.patch(`${BASE}/${id}/read`);
    return unwrapData<Notification>({ data }) as Notification;
  },

  markAllRead: async (): Promise<number> => {
    const { data } = await apiClient.post(`${BASE}/read-all`);
    return unwrapData<{ updated?: number }>({ data })?.updated ?? 0;
  },
} as const;
