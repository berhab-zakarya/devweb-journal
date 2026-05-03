/**
 * Review Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Review,
  ReviewDraft,
  ReviewUpdatePayload,
  ReviewFilters,
  ReviewsResponse,
} from './types/Review.types';

// Hooks (primary interface for components)
export { useReviews } from './hooks/useReviews';
export { useReview } from './hooks/useReview';

// Mutations
export {
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from './mutations/reviews.mutations';

// Query options (for prefetching in loaders/server components)
export {
  reviewsListQueryOptions,
  reviewsDetailQueryOptions,
} from './queries/reviews.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { reviewsKeys } from './queries/reviews.keys';
