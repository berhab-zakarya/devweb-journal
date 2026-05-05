import { queryOptions } from '@tanstack/react-query';
import { assignmentsService } from '../services/assignments.service';
import { assignmentsKeys } from './assignments.keys';

export const assignmentsMineQueryOptions = () =>
  queryOptions({
    queryKey: assignmentsKeys.mine(),
    queryFn: () => assignmentsService.listMineForReviewer(),
    staleTime: 60_000,
  });

export const assignmentsDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: assignmentsKeys.detail(id),
    queryFn: () => assignmentsService.getById(id),
    enabled: id > 0,
    staleTime: 60_000,
  });

export const assignmentReviewQueryOptions = (id: number) =>
  queryOptions({
    queryKey: assignmentsKeys.review(id),
    queryFn: () => assignmentsService.getReview(id),
    enabled: id > 0,
    staleTime: 60_000,
    retry: false,
  });
