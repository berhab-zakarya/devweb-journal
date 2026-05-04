import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '../types/Auth.types';

const BASE = ENDPOINTS.AUTH_BASE;

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(`${BASE}/login`, payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/register`, payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${BASE}/logout`);
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>(`${BASE}/me`);
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await apiClient.put<User>(`${BASE}/profile`, payload);
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/forgot-password`, payload);
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`${BASE}/reset-password`, payload);
    return data;
  },
} as const;
