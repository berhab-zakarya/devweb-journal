export interface PaginatorLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatorMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotifications {
  data: {
    data: Notification[];
    links: PaginatorLinks;
    meta: PaginatorMeta;
  };
}

export interface NotificationFilters {
  only_unread?: boolean;
  page?: number;
}

export interface UnreadCountResponse {
  data: {
    unread_count: number;
  };
  unread_count: number;
}
