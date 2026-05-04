'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoginMutation } from '../mutations/auth.mutations';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { Button, FormField, Input } from '@/shared/components/ui';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const login = useLoginMutation();
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    login.mutate(data, {
      onSuccess: (user) => {
        const roles = user.roles ?? [];
        const isReaderOnly =
          roles.includes('reader') &&
          !roles.some((r) => ['admin', 'editor', 'author', 'reviewer'].includes(r));
        router.push(isReaderOnly ? '/journal' : '/dashboard');
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
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {generalError && (
        <div
          role="alert"
          className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger"
        >
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

      {/* Password with inline "Forgot?" link */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-secondary">
            Password <span className="text-danger ml-0.5" aria-hidden="true">*</span>
          </label>
          <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-danger" role="alert">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        loading={isSubmitting || login.isPending}
      >
        Sign In
      </Button>
    </form>
  );
}
