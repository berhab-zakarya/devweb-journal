/**
 * Notification Service
 *
 * This is the ONLY place where API calls for the notifications feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Notification,
  NotificationDraft,
  NotificationUpdatePayload,
  NotificationFilters,
  NotificationsResponse,
} from '../types/Notification.types';

const BASE = ENDPOINTS.NOTIFICATIONS_BASE;

export const notificationsService = {
  /**
   * Fetch a paginated list of notifications.
   */
  getAll: async (filters?: NotificationFilters): Promise<NotificationsResponse> => {
    const { data } = await apiClient.get<NotificationsResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single notification by ID.
   */
  getById: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.get<Notification>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new notification.
   */
  create: async (payload: NotificationDraft): Promise<Notification> => {
    const { data } = await apiClient.post<Notification>(BASE, payload);
    return data;
  },

  /**
   * Update an existing notification.
   */
  update: async ({ id, ...payload }: NotificationUpdatePayload): Promise<Notification> => {
    const { data } = await apiClient.patch<Notification>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a notification by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
