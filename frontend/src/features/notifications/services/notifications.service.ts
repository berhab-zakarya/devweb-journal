import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Notification,
  PaginatedNotifications,
  NotificationFilters,
  UnreadCountResponse,
} from '../types/Notification.types';

const BASE = ENDPOINTS.NOTIFICATIONS_BASE;

export const notificationsService = {
  getAll: async (filters?: NotificationFilters): Promise<PaginatedNotifications> => {
    const { data } = await apiClient.get<PaginatedNotifications>(BASE, { params: filters });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<UnreadCountResponse>(`${BASE}/unread-count`);
    return data.unread_count;
  },

  markRead: async (id: number): Promise<Notification> => {
    const { data } = await apiClient.patch<{ message: string; data: Notification }>(`${BASE}/${id}/read`);
    return data.data;
  },

  markAllRead: async (): Promise<number> => {
    const { data } = await apiClient.post<{ message: string; data: { updated: number } }>(
      `${BASE}/read-all`
    );
    return data.data.updated;
  },
} as const;
