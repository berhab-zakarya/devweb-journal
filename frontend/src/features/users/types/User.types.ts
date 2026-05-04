export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
}

export interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
}

export interface AssignRolePayload {
  role: UserRole;
}
