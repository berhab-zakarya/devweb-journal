'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPasswordMutation } from '../mutations/auth.mutations';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { Button, FormField, Input } from '@/shared/components/ui';

const schema = z
  .object({
    email:                 z.string().email('Enter a valid email address'),
    password:              z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords don't match",
    path:    ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPassword = useResetPasswordMutation();
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    if (!token) {
      setGeneralError('Invalid or missing reset token. Please request a new link.');
      return;
    }
    resetPassword.mutate(
      { ...data, token },
      {
        onSuccess: () => router.push('/login?reset=1'),
        onError: (error) => {
          const fieldErrors = getLaravelFieldErrors(error);
          if (Object.keys(fieldErrors).length > 0) {
            for (const [field, message] of Object.entries(fieldErrors)) {
              setError(field as keyof FormData, { message });
            }
          } else {
            setGeneralError(getErrorMessage(error));
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {generalError && (
        <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
          {generalError}
        </div>
      )}

      <FormField id="email" label="Email address" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField id="password" label="New password" required error={errors.password?.message}
        hint="At least 8 characters">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <FormField
        id="password_confirmation"
        label="Confirm new password"
        required
        error={errors.password_confirmation?.message}
      >
        <Input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          error={!!errors.password_confirmation}
          {...register('password_confirmation')}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        loading={isSubmitting || resetPassword.isPending}
      >
        Reset Password
      </Button>
    </form>
  );
}
