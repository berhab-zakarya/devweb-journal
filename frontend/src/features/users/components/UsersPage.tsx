'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import {
  PageHeader,
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
  Pagination,
  TableFilterBar,
} from '@/shared/components/ui';
import { useUsers } from '../hooks/useUsers';
import { useDeleteUserMutation } from '../mutations/users.mutations';
import type { User, UserRole } from '../types/User.types';
import { UserFormDialog } from './UserFormDialog';
import { UsersTable } from './UsersTable';
import { UserDetailsDrawer } from './UserDetailsDrawer';

const ROLES: UserRole[] = ['admin', 'editor', 'reviewer', 'author', 'reader'];

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    page,
  });
  const deleteUser = useDeleteUserMutation();

  const users = data?.data?.data ?? [];
  const total = data?.data?.meta?.total ?? 0;
  const lastPage = data?.data?.meta?.last_page ?? 1;
  const perPage = data?.data?.meta?.per_page ?? 15;

  return (
    <div>
      {showCreate && <UserFormDialog onClose={() => setShowCreate(false)} />}
      <UserDetailsDrawer user={detailUser} open={!!detailUser} onClose={() => setDetailUser(null)} />

      <PageHeader
        title="Users"
        description="Manage platform users and roles"
        action={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        }
      />

      <Card padding="none">
        <TableFilterBar>
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search users…"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(1);
            }}
            className="h-9 px-3 text-sm border border-strong rounded bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </TableFilterBar>

        {isLoading && <LoadingState variant="table" rows={6} />}

        {isError && (
          <ErrorState message="Could not load users." onRetry={() => refetch()} className="py-12" />
        )}

        {!isLoading && !isError && users.length === 0 && (
          <EmptyState
            icon={<UserPlus className="w-6 h-6" />}
            title="No users found"
            description={search || roleFilter ? 'Try adjusting your filters.' : 'No users registered yet.'}
            className="py-16"
          />
        )}

        {!isLoading && !isError && users.length > 0 && (
          <UsersTable
            users={users}
            onDelete={(id) => deleteUser.mutate(id)}
            deletePending={deleteUser.isPending}
            onView={(u) => setDetailUser(u)}
          />
        )}

        {!isLoading && !isError && total > perPage && (
          <div className="px-4 py-3 border-t border-subtle">
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              from={(page - 1) * perPage + 1}
              to={Math.min(page * perPage, total)}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
