/**
 * Auth Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Auth,
  AuthDraft,
  AuthUpdatePayload,
  AuthFilters,
  AuthsResponse,
} from './types/Auth.types';

// Hooks (primary interface for components)
export { useAuths } from './hooks/useAuths';
export { useAuth } from './hooks/useAuth';

// Mutations
export {
  useCreateAuthMutation,
  useUpdateAuthMutation,
  useDeleteAuthMutation,
} from './mutations/auth.mutations';

// Query options (for prefetching in loaders/server components)
export {
  authListQueryOptions,
  authDetailQueryOptions,
} from './queries/auth.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { authKeys } from './queries/auth.keys';
