import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  User,
  UserFilters,
  PaginatedUsers,
  CreateUserPayload,
  UpdateUserPayload,
  AssignRolePayload,
} from '../types/User.types';

const BASE = ENDPOINTS.USERS_BASE;

export const usersService = {
  getAll: async (filters?: UserFilters): Promise<PaginatedUsers> => {
    const { data } = await apiClient.get<PaginatedUsers>(BASE, { params: filters });
    return data;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<User>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post<User>(BASE, payload);
    return data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.put<User>(`${BASE}/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  assignRole: async (id: number, payload: AssignRolePayload): Promise<User> => {
    const { data } = await apiClient.post<User>(`${BASE}/${id}/assign-role`, payload);
    return data;
  },
} as const;
