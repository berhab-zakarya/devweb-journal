'use client';

import { useAssignRoleMutation } from '../mutations/users.mutations';
import type { User, UserRole } from '../types/User.types';

const ROLES: UserRole[] = ['admin', 'editor', 'reviewer', 'author', 'reader'];

export function UserRoleSelector({ user }: Readonly<{ user: User }>) {
  const assignRole = useAssignRoleMutation(user.id);
  const currentRole = user.roles[0] ?? 'reader';

  return (
    <select
      value={currentRole}
      onChange={(e) => assignRole.mutate({ role: e.target.value as UserRole })}
      disabled={assignRole.isPending}
      className="text-xs border border-strong rounded px-2 py-1 bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </option>
      ))}
    </select>
  );
}
