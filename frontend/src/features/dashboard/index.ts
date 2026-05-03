/**
 * Dashboard Feature — Public API
 *
 * Only export what consumers of this feature need.
 * Internal implementation details remain private.
 */

// Types
export type {
  Dashboard,
  DashboardDraft,
  DashboardUpdatePayload,
  DashboardFilters,
  DashboardsResponse,
} from './types/Dashboard.types';

// Hooks (primary interface for components)
export { useDashboards } from './hooks/useDashboards';
export { useDashboard } from './hooks/useDashboard';

// Mutations
export {
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useDeleteDashboardMutation,
} from './mutations/dashboard.mutations';

// Query options (for prefetching in loaders/server components)
export {
  dashboardListQueryOptions,
  dashboardDetailQueryOptions,
} from './queries/dashboard.queries';

// Query keys (for targeted invalidation from other features via shared/)
export { dashboardKeys } from './queries/dashboard.keys';
