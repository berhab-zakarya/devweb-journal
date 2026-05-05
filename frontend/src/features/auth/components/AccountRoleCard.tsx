'use client';

import { Shield } from 'lucide-react';
import { Card, SectionHeader, RoleBadge, type Role } from '@/shared/components/ui';
import type { User } from '../types/Auth.types';

export function AccountRoleCard({ user }: Readonly<{ user: User }>) {
  return (
    <Card>
      <SectionHeader title="Account role" className="mb-4" />
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
          <Shield className="w-5 h-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm text-secondary mb-2">Roles assigned to your account in this application.</p>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((r) => (
              <RoleBadge key={r} role={r as Role} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
