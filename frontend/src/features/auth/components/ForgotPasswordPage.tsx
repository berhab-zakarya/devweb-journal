'use client';

import Link from 'next/link';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export function ForgotPasswordPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-primary mb-1">Reset your password</h2>
      <p className="text-sm text-muted mb-6">
        Enter your email and we&apos;ll send a reset link if an account exists.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-muted">
        Remember your password?{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
