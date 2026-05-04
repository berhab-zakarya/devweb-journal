'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfileMutation } from '../mutations/auth.mutations';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { Button, FormField, Input } from '@/shared/components/ui';

const schema = z
  .object({
    current_password:      z.string().min(1, 'Current password is required'),
    password:              z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords don't match",
    path:    ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export interface ChangePasswordFormProps {
  userName: string;
  userEmail: string;
}

export function ChangePasswordForm({ userName, userEmail }: ChangePasswordFormProps) {
  const update = useUpdateProfileMutation();
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    setSuccess(false);
    update.mutate(
      {
        name:  userName,
        email: userEmail,
        current_password:      data.current_password,
        password:              data.password,
        password_confirmation: data.password_confirmation,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          reset();
        },
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
      {success && (
        <div aria-live="polite" className="px-3 py-2.5 rounded-md bg-green-50 border border-green-200 text-sm text-success">
          Password changed successfully.
        </div>
      )}

      <FormField
        id="current_password"
        label="Current password"
        required
        error={errors.current_password?.message}
      >
        <Input
          id="current_password"
          type="password"
          autoComplete="current-password"
          placeholder="Your current password"
          error={!!errors.current_password}
          {...register('current_password')}
        />
      </FormField>

      <FormField id="new_password" label="New password" required error={errors.password?.message}
        hint="At least 8 characters">
        <Input
          id="new_password"
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

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting || update.isPending}
        >
          Change Password
        </Button>
      </div>
    </form>
  );
}
