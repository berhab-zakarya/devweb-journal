/**
 * User Domain Types
 *
 * All types for the users feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your User-specific fields here
}

export interface UserDraft {
  // TODO: fields required to create a new User
}

export interface UserUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface UserFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
