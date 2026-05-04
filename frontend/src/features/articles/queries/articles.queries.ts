import { queryOptions } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';
import { articlesKeys } from './articles.keys';
import type { ArticleFilters } from '../types/Article.types';

export const articlesListQueryOptions = (filters?: ArticleFilters) =>
  queryOptions({
    queryKey: articlesKeys.list(filters),
    queryFn: () => articlesService.getAll(filters),
    staleTime: 60_000,
  });

export const articlesDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: articlesKeys.detail(id),
    queryFn: () => articlesService.getById(id),
    enabled: id > 0,
    staleTime: 60_000,
  });

export const articleVersionsQueryOptions = (articleId: number) =>
  queryOptions({
    queryKey: articlesKeys.versions(articleId),
    queryFn: () => articlesService.getVersions(articleId),
    enabled: articleId > 0,
    staleTime: 60_000,
  });

export const articleAssignmentsQueryOptions = (articleId: number) =>
  queryOptions({
    queryKey: articlesKeys.assignments(articleId),
    queryFn: () => articlesService.getAssignments(articleId),
    enabled: articleId > 0,
    staleTime: 60_000,
  });

export const articleReviewsQueryOptions = (articleId: number) =>
  queryOptions({
    queryKey: articlesKeys.reviews(articleId),
    queryFn: () => articlesService.getReviews(articleId),
    enabled: articleId > 0,
    staleTime: 60_000,
  });

export const articleDecisionQueryOptions = (articleId: number) =>
  queryOptions({
    queryKey: articlesKeys.decision(articleId),
    queryFn: () => articlesService.getDecision(articleId),
    enabled: articleId > 0,
    staleTime: 60_000,
    retry: false,
  });

export const assignmentReviewQueryOptions = (assignmentId: number) =>
  queryOptions({
    queryKey: articlesKeys.assignmentReview(assignmentId),
    queryFn: () => articlesService.getAssignmentReview(assignmentId),
    enabled: assignmentId > 0,
    staleTime: 60_000,
    retry: false,
  });
