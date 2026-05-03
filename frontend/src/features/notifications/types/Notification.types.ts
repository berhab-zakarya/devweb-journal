/**
 * Notification Domain Types
 *
 * All types for the notifications feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Notification {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Notification-specific fields here
}

export interface NotificationDraft {
  // TODO: fields required to create a new Notification
}

export interface NotificationUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface NotificationFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Notification;
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
