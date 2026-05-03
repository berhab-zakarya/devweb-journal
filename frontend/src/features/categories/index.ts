/**
 * Category Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Category,
  CategoryDraft,
  CategoryUpdatePayload,
  CategoryFilters,
  CategoriesResponse,
} from './types/Category.types';

// Hooks (primary interface for components)
export { useCategories } from './hooks/useCategories';
export { useCategory } from './hooks/useCategory';

// Mutations
export {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from './mutations/categories.mutations';

// Query options (for prefetching in loaders/server components)
export {
  categoriesListQueryOptions,
  categoriesDetailQueryOptions,
} from './queries/categories.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { categoriesKeys } from './queries/categories.keys';
