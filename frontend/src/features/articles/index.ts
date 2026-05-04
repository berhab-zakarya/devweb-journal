export type {
  Article,
  ArticleVersion,
  ArticleAssignment,
  ArticleReview,
  EditorialDecision,
  ReviewerSearchResult,
  ArticleFilters,
  PaginatedArticles,
  CreateArticlePayload,
  UpdateArticlePayload,
  CreateVersionPayload,
  CreateDecisionPayload,
  AssignReviewersPayload,
  RespondAssignmentPayload,
  SubmitReviewPayload,
  ArticleStatus,
  DecisionType,
  AssignmentStatus,
  AssignmentResponse,
} from './types/Article.types';

export { useArticles } from './hooks/useArticles';
export { useArticle } from './hooks/useArticle';
export { useArticleVersions } from './hooks/useArticleVersions';
export { useArticleAssignments } from './hooks/useArticleAssignments';
export { useArticleDecision } from './hooks/useArticleDecision';
export { useArticleReviews } from './hooks/useArticleReviews';

export {
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useCreateVersionMutation,
  useAssignReviewersMutation,
  useDeleteAssignmentMutation,
  useRespondAssignmentMutation,
  useSubmitReviewMutation,
  useCreateDecisionMutation,
} from './mutations/articles.mutations';

export {
  articlesListQueryOptions,
  articlesDetailQueryOptions,
  articleVersionsQueryOptions,
  articleAssignmentsQueryOptions,
  articleReviewsQueryOptions,
  articleDecisionQueryOptions,
  assignmentReviewQueryOptions,
} from './queries/articles.queries';

export { articlesKeys } from './queries/articles.keys';
