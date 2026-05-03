/**
 * Publication Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Publication,
  PublicationDraft,
  PublicationUpdatePayload,
  PublicationFilters,
  PublicationsResponse,
} from './types/Publication.types';

// Hooks (primary interface for components)
export { usePublications } from './hooks/usePublications';
export { usePublication } from './hooks/usePublication';

// Mutations
export {
  useCreatePublicationMutation,
  useUpdatePublicationMutation,
  useDeletePublicationMutation,
} from './mutations/publications.mutations';

// Query options (for prefetching in loaders/server components)
export {
  publicationsListQueryOptions,
  publicationsDetailQueryOptions,
} from './queries/publications.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { publicationsKeys } from './queries/publications.keys';
