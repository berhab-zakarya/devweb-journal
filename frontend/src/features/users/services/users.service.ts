/**
 * User Service
 *
 * This is the ONLY place where API calls for the users feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  User,
  UserDraft,
  UserUpdatePayload,
  UserFilters,
  UsersResponse,
} from '../types/User.types';

const BASE = ENDPOINTS.USERS_BASE;

export const usersService = {
  /**
   * Fetch a paginated list of users.
   */
  getAll: async (filters?: UserFilters): Promise<UsersResponse> => {
    const { data } = await apiClient.get<UsersResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single user by ID.
   */
  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new user.
   */
  create: async (payload: UserDraft): Promise<User> => {
    const { data } = await apiClient.post<User>(BASE, payload);
    return data;
  },

  /**
   * Update an existing user.
   */
  update: async ({ id, ...payload }: UserUpdatePayload): Promise<User> => {
    const { data } = await apiClient.patch<User>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a user by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
