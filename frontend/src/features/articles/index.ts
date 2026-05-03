/**
 * Article Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Article,
  ArticleDraft,
  ArticleUpdatePayload,
  ArticleFilters,
  ArticlesResponse,
} from './types/Article.types';

// Hooks (primary interface for components)
export { useArticles } from './hooks/useArticles';
export { useArticle } from './hooks/useArticle';

// Mutations
export {
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} from './mutations/articles.mutations';

// Query options (for prefetching in loaders/server components)
export {
  articlesListQueryOptions,
  articlesDetailQueryOptions,
} from './queries/articles.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { articlesKeys } from './queries/articles.keys';
