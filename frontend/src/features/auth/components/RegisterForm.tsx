'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '../mutations/auth.mutations';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { Button, FormField, Input, Select } from '@/shared/components/ui';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['author', 'reader'], { required_error: 'Choose author or reader' }),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const register = useRegisterMutation();
  const [generalError, setGeneralError] = useState('');

  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'reader' },
  });

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    register.mutate(data, {
      onSuccess: () => router.push('/login?registered=1'),
      onError: (error) => {
        const fieldErrors = getLaravelFieldErrors(error);
        if (Object.keys(fieldErrors).length > 0) {
          for (const [f, message] of Object.entries(fieldErrors)) {
            setError(f as keyof FormData, { message });
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
        <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
          {generalError}
        </div>
      )}

      <FormField id="name" label="Full name" required error={errors.name?.message}>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          error={!!errors.name}
          {...field('name')}
        />
      </FormField>

      <FormField id="email" label="Email address" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={!!errors.email}
          {...field('email')}
        />
      </FormField>

      <FormField id="role" label="I am registering as" required error={errors.role?.message}>
        <Select id="role" error={!!errors.role} {...field('role')}>
          <option value="reader">Reader — browse published work</option>
          <option value="author">Author — submit manuscripts</option>
          <option value="editor">Editeur </option>
          <option value="reviewer">Reviewer </option>


        </Select>
      </FormField>

      <FormField id="password" label="Password" required error={errors.password?.message}
        hint="At least 8 characters">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          error={!!errors.password}
          {...field('password')}
        />
      </FormField>

      <FormField
        id="password_confirmation"
        label="Confirm password"
        required
        error={errors.password_confirmation?.message}
      >
        <Input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={!!errors.password_confirmation}
          {...field('password_confirmation')}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        loading={isSubmitting || register.isPending}
      >
        Create Account
      </Button>
    </form>
  );
}
