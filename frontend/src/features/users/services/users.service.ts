import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import { normalizeLaravelPaginator, unwrapData } from '@/shared/api/response';
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
    const response = await apiClient.get(BASE, { params: filters });
    return normalizeLaravelPaginator<User>(response);
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return unwrapData<User>({ data }) as User;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post(BASE, payload);
    return unwrapData<User>({ data }) as User;
  },

  update: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.put(`${BASE}/${id}`, payload);
    return unwrapData<User>({ data }) as User;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  assignRole: async (id: number, payload: AssignRolePayload): Promise<User> => {
    const { data } = await apiClient.post(`${BASE}/${id}/assign-role`, payload);
    return unwrapData<User>({ data }) as User;
  },
} as const;
