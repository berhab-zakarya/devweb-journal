'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ResetPasswordForm } from './ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-primary mb-1">Set a new password</h2>
      <p className="text-sm text-muted mb-6">Choose a strong password for your account.</p>

      <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
        <ResetPasswordForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
