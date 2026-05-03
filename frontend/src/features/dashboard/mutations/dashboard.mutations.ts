/**
 * Dashboard Mutations
 *
 * TanStack Query mutation factories.
 * Each mutation handles cache invalidation automatically.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { dashboardKeys } from '../queries/dashboard.keys';
import type {
  DashboardDraft,
  DashboardUpdatePayload,
} from '../types/Dashboard.types';

/**
 * Create a new dashboard.
 */
export function useCreateDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DashboardDraft) => dashboardService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });
    },
  });
}

/**
 * Update an existing dashboard.
 */
export function useUpdateDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DashboardUpdatePayload) => dashboardService.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });
      queryClient.setQueryData(dashboardKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Delete a dashboard.
 */
export function useDeleteDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dashboardService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });
      queryClient.removeQueries({ queryKey: dashboardKeys.detail(id) });
    },
  });
}
