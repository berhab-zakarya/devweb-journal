import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type { Notification, PaginatedNotifications, NotificationFilters, UnreadCount } from '../types/Notification.types';

const BASE = ENDPOINTS.NOTIFICATIONS_BASE;

export const notificationsService = {
  getAll: async (filters?: NotificationFilters): Promise<PaginatedNotifications> => {
    const { data } = await apiClient.get<PaginatedNotifications>(BASE, { params: filters });
    return data;
  },

  getUnreadCount: async (): Promise<UnreadCount> => {
    const { data } = await apiClient.get<UnreadCount>(`${BASE}/unread-count`);
    return data;
  },

  markRead: async (id: number): Promise<Notification> => {
    const { data } = await apiClient.patch<Notification>(`${BASE}/${id}/read`);
    return data;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post(`${BASE}/read-all`);
  },
} as const;
