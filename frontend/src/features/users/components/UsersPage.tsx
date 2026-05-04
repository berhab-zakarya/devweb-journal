'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Trash2, X } from 'lucide-react';
import {
  PageHeader,
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
  Pagination,
  TableContainer,
  TableFilterBar,
  TableWrapper,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  Button,
  FormField,
  Input,
  Select,
  RoleBadge,
} from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useUsers } from '../hooks/useUsers';
import { useCreateUserMutation, useDeleteUserMutation, useAssignRoleMutation } from '../mutations/users.mutations';
import type { User, UserRole } from '../types/User.types';
const ROLES: UserRole[] = ['admin', 'editor', 'reviewer', 'author', 'reader'];

const createSchema = z.object({
  name:                 z.string().min(2, 'Name must be at least 2 characters'),
  email:                z.string().email('Enter a valid email address'),
  password:             z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(8, 'Please confirm the password'),
  role:                 z.enum(['admin', 'editor', 'reviewer', 'author', 'reader']),
});
type CreateFormData = z.infer<typeof createSchema>;

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const createUser = useCreateUserMutation();
  const [generalError, setGeneralError] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateFormData>({ resolver: zodResolver(createSchema) });

  const onSubmit = (data: CreateFormData) => {
    setGeneralError('');
    createUser.mutate(data, {
      onSuccess: onClose,
      onError: (error) => {
        const fieldErrors = getLaravelFieldErrors(error);
        if (Object.keys(fieldErrors).length > 0) {
          for (const [field, message] of Object.entries(fieldErrors)) {
            setError(field as keyof CreateFormData, { message });
          }
        } else {
          setGeneralError(getErrorMessage(error));
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-lg shadow-dialog w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-primary">Create User</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded text-muted hover:text-secondary hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {generalError && (
            <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
              {generalError}
            </div>
          )}

          <FormField id="name" label="Full name" required error={errors.name?.message}>
            <Input id="name" type="text" placeholder="Jane Doe" error={!!errors.name} {...register('name')} />
          </FormField>

          <FormField id="email" label="Email address" required error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@example.com" error={!!errors.email} {...register('email')} />
          </FormField>

          <FormField id="password" label="Password" required error={errors.password?.message} hint="Min. 8 characters">
            <Input id="password" type="password" placeholder="••••••••" error={!!errors.password} {...register('password')} />
          </FormField>

          <FormField id="password_confirmation" label="Confirm password" required error={errors.password_confirmation?.message}>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="••••••••"
              error={!!errors.password_confirmation}
              {...register('password_confirmation')}
            />
          </FormField>

          <FormField id="role" label="Role" required error={errors.role?.message}>
            <Select id="role" error={!!errors.role} {...register('role')}>
              <option value="">Select a role…</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting || createUser.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleSelectCell({ user }: { user: User }) {
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
        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
      ))}
    </select>
  );
}

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

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
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}

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
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search users…"
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as UserRole | ''); setPage(1); }}
            className="h-9 px-3 text-sm border border-strong rounded bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
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
          <TableContainer>
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
                      <div className="flex items-center gap-2">
                        {user.roles.map((r) => <RoleBadge key={r} role={r} />)}
                      </div>
                    </Td>
                    <Td className="text-muted text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <RoleSelectCell user={user} />
                        <button
                          type="button"
                          onClick={() => deleteUser.mutate(user.id)}
                          disabled={deleteUser.isPending}
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
          </TableContainer>
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
