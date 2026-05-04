export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'author' | 'reader';
}

/**
 * Backend response wrappers matching Swagger
 */
export interface AuthMessageResponse {
  message: string;
}

export interface AuthDataResponse<T = User> {
  message?: string;
  data: T;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}
