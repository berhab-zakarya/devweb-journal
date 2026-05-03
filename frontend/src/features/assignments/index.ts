/**
 * Assignment Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Assignment,
  AssignmentDraft,
  AssignmentUpdatePayload,
  AssignmentFilters,
  AssignmentsResponse,
} from './types/Assignment.types';

// Hooks (primary interface for components)
export { useAssignments } from './hooks/useAssignments';
export { useAssignment } from './hooks/useAssignment';

// Mutations
export {
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} from './mutations/assignments.mutations';

// Query options (for prefetching in loaders/server components)
export {
  assignmentsListQueryOptions,
  assignmentsDetailQueryOptions,
} from './queries/assignments.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { assignmentsKeys } from './queries/assignments.keys';
