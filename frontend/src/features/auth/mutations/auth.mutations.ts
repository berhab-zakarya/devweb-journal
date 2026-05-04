import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resetCsrfCookieCache } from '@/shared/api/csrf';
import { authService } from '../services/auth.service';
import { authKeys } from '../queries/auth.keys';
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '../types/Auth.types';

const isBrowser = globalThis.window !== undefined;

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user) => {
      // New session after login — allow the next `ensureCsrfCookie()` to hit the server again.
      resetCsrfCookieCache();
      // Seed the current user cache immediately to avoid a race where the
      // UI navigates to a protected route then `/auth/me` fires and returns
      // 401 before the session cookie is fully established.
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Remove only auth-related queries and clear current user cache.
      // Do not perform a global redirect here — the UI layer should
      // navigate after the mutation settles to avoid navigation races.
      if (isBrowser) {
        resetCsrfCookieCache();
        queryClient.removeQueries({ queryKey: authKeys.all });
        queryClient.setQueryData(authKeys.me(), undefined);
      }
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}
