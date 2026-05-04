import { apiClient } from '@/shared/api/client';
import { ensureCsrfCookie } from '@/shared/api/csrf';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  AuthDataResponse,
  AuthMessageResponse,
} from '../types/Auth.types';

const BASE = ENDPOINTS.AUTH_BASE;

export const authService = {
  login: async (payload: LoginPayload): Promise<User> => {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<AuthDataResponse<User>>(`${BASE}/login`, payload);
    return data.data;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<AuthDataResponse<User>>(`${BASE}/register`, payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await ensureCsrfCookie();
    await apiClient.post(`${BASE}/logout`);
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<AuthDataResponse<User>>(`${BASE}/me`);
    return data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    await ensureCsrfCookie();
    const { data } = await apiClient.put<AuthDataResponse<User>>(`${BASE}/profile`, payload);
    return data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<AuthMessageResponse> => {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<AuthMessageResponse>(`${BASE}/forgot-password`, payload);
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<AuthMessageResponse> => {
    await ensureCsrfCookie();
    const { data } = await apiClient.post<AuthMessageResponse>(`${BASE}/reset-password`, payload);
    return data;
  },
} as const;
