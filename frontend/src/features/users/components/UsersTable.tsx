'use client';

import { Trash2 } from 'lucide-react';
import {
  TableWrapper,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
} from '@/shared/components/ui';
import type { User } from '../types/User.types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserRoleSelector } from './UserRoleSelector';

export function UsersTable({
  users,
  onDelete,
  deletePending,
  onView,
}: Readonly<{
  users: User[];
  onDelete: (id: number) => void;
  deletePending: boolean;
  onView: (user: User) => void;
}>) {
  return (
    <TableWrapper>
      <TableHead>
        <tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Joined</Th>
          <Th> </Th>
        </tr>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <Tr key={user.id}>
            <Td className="font-medium text-primary">{user.name}</Td>
            <Td className="text-muted">{user.email}</Td>
            <Td>
              <div className="flex items-center gap-2 flex-wrap">
                {user.roles.map((r) => (
                  <UserRoleBadge key={r} role={r} />
                ))}
              </div>
            </Td>
            <Td className="text-muted text-sm">{new Date(user.created_at).toLocaleDateString()}</Td>
            <Td>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onView(user)}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  View
                </button>
                <UserRoleSelector user={user} />
                <button
                  type="button"
                  onClick={() => onDelete(user.id)}
                  disabled={deletePending}
                  className="p-1.5 rounded text-muted hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label={`Delete ${user.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </TableBody>
    </TableWrapper>
  );
}
