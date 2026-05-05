'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button, FormField, Input, Select } from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCreateUserMutation } from '../mutations/users.mutations';
import type { UserRole } from '../types/User.types';

const ROLES: UserRole[] = ['admin', 'editor', 'reviewer', 'author', 'reader'];

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(8, 'Please confirm the password'),
  role: z.enum(['admin', 'editor', 'reviewer', 'author', 'reader']),
});
type CreateFormData = z.infer<typeof createSchema>;

export function UserFormDialog({ onClose }: Readonly<{ onClose: () => void }>) {
  const createUser = useCreateUserMutation();
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormData>({ resolver: zodResolver(createSchema) });

  const onSubmit = (data: CreateFormData) => {
    setGeneralError('');
    createUser.mutate(data, {
      onSuccess: onClose,
      onError: (error) => {
        const fieldErrors = getLaravelFieldErrors(error);
        if (Object.keys(fieldErrors).length > 0) {
          for (const [field, message] of Object.entries(fieldErrors)) {
            setError(field as keyof CreateFormData, { message });
          }
        } else {
          setGeneralError(getErrorMessage(error));
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-lg shadow-dialog w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-primary">Create User</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-muted hover:text-secondary hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {generalError && (
            <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
              {generalError}
            </div>
          )}

          <FormField id="name" label="Full name" required error={errors.name?.message}>
            <Input id="name" type="text" placeholder="Jane Doe" error={!!errors.name} {...register('name')} />
          </FormField>

          <FormField id="email" label="Email address" required error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@example.com" error={!!errors.email} {...register('email')} />
          </FormField>

          <FormField id="password" label="Password" required error={errors.password?.message} hint="Min. 8 characters">
            <Input id="password" type="password" placeholder="••••••••" error={!!errors.password} {...register('password')} />
          </FormField>

          <FormField id="password_confirmation" label="Confirm password" required error={errors.password_confirmation?.message}>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="••••••••"
              error={!!errors.password_confirmation}
              {...register('password_confirmation')}
            />
          </FormField>

          <FormField id="role" label="Role" required error={errors.role?.message}>
            <Select id="role" error={!!errors.role} {...register('role')}>
              <option value="">Select a role…</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting || createUser.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
