/**
 * Normalize API-provided dashboard routes to match Next app routes.
 */
export function normalizeDashboardRoute(route: string): string {
  if (route === '/admin/users') return '/users';
  return route;
}
