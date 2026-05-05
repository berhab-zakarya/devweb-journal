import { apiClient } from '@/shared/api/client';
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
  AuthWithTokenData,
} from '../types/Auth.types';

const BASE = ENDPOINTS.AUTH_BASE;

export const authService = {
  login: async (payload: LoginPayload): Promise<User> => {
    const { data } = await apiClient.post<AuthDataResponse<AuthWithTokenData>>(`${BASE}/login`, payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.data.token);
    }
    const { token: _token, ...user } = data.data;
    return user as User;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post<AuthDataResponse<AuthWithTokenData>>(`${BASE}/register`, payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.data.token);
    }
    const { token: _token, ...user } = data.data;
    return user as User;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${BASE}/logout`);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<AuthDataResponse<User>>(`${BASE}/me`);
    return data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await apiClient.put<AuthDataResponse<User>>(`${BASE}/profile`, payload);
    return data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<AuthMessageResponse> => {
    const { data } = await apiClient.post<AuthMessageResponse>(`${BASE}/forgot-password`, payload);
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<AuthMessageResponse> => {
    const { data } = await apiClient.post<AuthMessageResponse>(`${BASE}/reset-password`, payload);
    return data;
  },
} as const;
