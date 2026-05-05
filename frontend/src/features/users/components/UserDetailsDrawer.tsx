'use client';

import { Modal, Button } from '@/shared/components/ui';
import type { User } from '../types/User.types';
import { UserRoleBadge } from './UserRoleBadge';

export function UserDetailsDrawer({
  user,
  open,
  onClose,
}: Readonly<{
  user: User | null;
  open: boolean;
  onClose: () => void;
}>) {
  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title="User details">
      <dl className="space-y-3 text-sm text-secondary mb-6">
        <div>
          <dt className="text-muted font-medium">Name</dt>
          <dd className="text-primary mt-0.5">{user.name}</dd>
        </div>
        <div>
          <dt className="text-muted font-medium">Email</dt>
          <dd className="text-primary mt-0.5">{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted font-medium">Roles</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {user.roles.map((r) => (
              <UserRoleBadge key={r} role={r} />
            ))}
          </dd>
        </div>
        <div>
          <dt className="text-muted font-medium">Joined</dt>
          <dd>{new Date(user.created_at).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
