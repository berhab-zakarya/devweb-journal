'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from './LoginForm';

function LoginNotice() {
  const params = useSearchParams();
  if (params.get('registered') === '1') {
    return (
      <div
        aria-live="polite"
        className="px-3 py-2.5 rounded-md bg-green-50 border border-green-200 text-sm text-success mb-4"
      >
        Account created! Sign in to continue.
      </div>
    );
  }
  if (params.get('reset') === '1') {
    return (
      <div
        aria-live="polite"
        className="px-3 py-2.5 rounded-md bg-green-50 border border-green-200 text-sm text-success mb-4"
      >
        Password reset successfully. Sign in with your new password.
      </div>
    );
  }
  return null;
}

export function LoginPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-primary mb-1">Welcome back</h2>
      <p className="text-sm text-muted mb-6">Sign in to your account to continue</p>

      <Suspense>
        <LoginNotice />
      </Suspense>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-600 hover:underline font-medium">
          Create one
        </Link>
      </p>
    </>
  );
}
