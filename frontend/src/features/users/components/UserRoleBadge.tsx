'use client';

import { RoleBadge, type Role } from '@/shared/components/ui';

export function UserRoleBadge({ role }: Readonly<{ role: string }>) {
  return <RoleBadge role={role as Role} pill />;
}
