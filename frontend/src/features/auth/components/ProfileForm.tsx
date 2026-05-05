'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfileMutation } from '../mutations/auth.mutations';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { Button, FormField, Input } from '@/shared/components/ui';
import type { User } from '../types/Auth.types';

const schema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export interface ProfileInfoFormProps {
  user: User;
}

/** @alias legacy name */
export type ProfileFormProps = ProfileInfoFormProps;

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const update = useUpdateProfileMutation();
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, email: user.email },
  });

  useEffect(() => {
    reset({ name: user.name, email: user.email });
  }, [user, reset]);

  const onSubmit = (data: FormData) => {
    setGeneralError('');
    setSuccess(false);
    update.mutate(data, {
      onSuccess: () => {
        setSuccess(true);
        reset(data);
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
        <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
          {generalError}
        </div>
      )}
      {success && (
        <div aria-live="polite" className="px-3 py-2.5 rounded-md bg-green-50 border border-green-200 text-sm text-success">
          Profile updated successfully.
        </div>
      )}

      <FormField id="name" label="Full name" required error={errors.name?.message}>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          error={!!errors.name}
          {...register('name')}
        />
      </FormField>

      <FormField id="email" label="Email address" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting || update.isPending}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export { ProfileInfoForm as ProfileForm };
