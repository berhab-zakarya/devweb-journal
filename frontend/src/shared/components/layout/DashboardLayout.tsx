'use client';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogoutMutation } from '@/features/auth/mutations/auth.mutations';
import { AppShell } from './AppShell';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  const logout = useLogoutMutation();

  return (
    <AppShell
      user={user ?? null}
      onLogout={() => logout.mutate()}
    >
      {children}
    </AppShell>
  );
}
