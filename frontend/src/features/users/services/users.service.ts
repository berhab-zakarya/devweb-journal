import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  User,
  UserFilters,
  PaginatedUsers,
  CreateUserPayload,
  UpdateUserPayload,
  AssignRolePayload,
  PaginatedResponse,
} from '../types/User.types';

const BASE = ENDPOINTS.USERS_BASE;

export const usersService = {
  getAll: async (filters?: UserFilters): Promise<PaginatedUsers> => {
    const { data } = await apiClient.get<{ data: PaginatedResponse<User> }>(BASE, { params: filters });
    return { data: data.data };
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<{ data: User }>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post<{ message: string; data: User }>(BASE, payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.put<{ message: string; data: User }>(`${BASE}/${id}`, payload);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  assignRole: async (id: number, payload: AssignRolePayload): Promise<User> => {
    const { data } = await apiClient.post<{ message: string; data: User }>(`${BASE}/${id}/assign-role`, payload);
    return data.data;
  },
} as const;
