export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  data?: Record<string, unknown>;
}

export interface PaginatedNotifications {
  data: Notification[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface NotificationFilters {
  only_unread?: boolean;
  page?: number;
}

export interface UnreadCount {
  count: number;
}
