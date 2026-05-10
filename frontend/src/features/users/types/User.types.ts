import type { NormalizedPaginatedList } from '@/shared/api/response';

export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';

export interface PaginatorLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface PaginatorMeta {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  path?: string;
  per_page?: number;
  to?: number | null;
  total?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginatorLinks;
  meta: PaginatorMeta;
}

export interface PaginatedUsers extends NormalizedPaginatedList<User> {}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface AssignRolePayload {
  role: UserRole;
}
