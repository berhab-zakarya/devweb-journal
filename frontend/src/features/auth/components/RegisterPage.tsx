'use client';

import Link from 'next/link';
import { RegisterForm } from './RegisterForm';

export function RegisterPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-primary mb-1">Create an account</h2>
      <p className="text-sm text-muted mb-6">
        Join DevWeb Journal — you&apos;ll start as a reader
      </p>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
