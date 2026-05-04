'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/articles.service';
import { articlesKeys } from '../queries/articles.keys';
import type {
  CreateArticlePayload,
  UpdateArticlePayload,
  CreateVersionPayload,
  CreateDecisionPayload,
  AssignReviewersPayload,
  RespondAssignmentPayload,
  SubmitReviewPayload,
} from '../types/Article.types';

export function useCreateArticleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateArticlePayload) => articlesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.lists() }),
  });
}

export function useUpdateArticleMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateArticlePayload) => articlesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articlesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: articlesKeys.lists() });
    },
  });
}

export function useDeleteArticleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => articlesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.lists() }),
  });
}

export function useCreateVersionMutation(articleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVersionPayload) => articlesService.createVersion(articleId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.versions(articleId) }),
  });
}

export function useAssignReviewersMutation(articleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignReviewersPayload) => articlesService.assignReviewers(articleId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.assignments(articleId) }),
  });
}

export function useDeleteAssignmentMutation(articleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: number) => articlesService.deleteAssignment(assignmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.assignments(articleId) }),
  });
}

export function useRespondAssignmentMutation(assignmentId: number, articleId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RespondAssignmentPayload) => articlesService.respondAssignment(assignmentId, payload),
    onSuccess: () => {
      if (articleId) qc.invalidateQueries({ queryKey: articlesKeys.assignments(articleId) });
    },
  });
}

export function useSubmitReviewMutation(assignmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => articlesService.submitReview(assignmentId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: articlesKeys.assignmentReview(assignmentId) }),
  });
}

export function useCreateDecisionMutation(articleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDecisionPayload) => articlesService.createDecision(articleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: articlesKeys.decision(articleId) });
      qc.invalidateQueries({ queryKey: articlesKeys.detail(articleId) });
    },
  });
}
