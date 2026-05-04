'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPasswordMutation } from '../mutations/auth.mutations';
import { getErrorMessage } from '@/shared/utils/errors';
import { Button, FormField, Input } from '@/shared/components/ui';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPasswordMutation();
  const [submitted, setSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    forgotPassword.mutate(data, {
      onSuccess: () => setSubmitted(true),
      onError: (error) => setGeneralError(getErrorMessage(error)),
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-primary mb-1">Check your email</h3>
        <p className="text-sm text-muted">
          If an account exists for that address, we&apos;ve sent a reset link.
        </p>
      </div>
    );
  }

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

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        loading={isSubmitting || forgotPassword.isPending}
      >
        Send Reset Link
      </Button>
    </form>
  );
}
