/**
 * User Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  User,
  UserDraft,
  UserUpdatePayload,
  UserFilters,
  UsersResponse,
} from './types/User.types';

// Hooks (primary interface for components)
export { useUsers } from './hooks/useUsers';
export { useUser } from './hooks/useUser';

// Mutations
export {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from './mutations/users.mutations';

// Query options (for prefetching in loaders/server components)
export {
  usersListQueryOptions,
  usersDetailQueryOptions,
} from './queries/users.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { usersKeys } from './queries/users.keys';
