import type { DashboardItem } from '../types/Dashboard.types';

/**
 * Dashboard role helpers for role-based content filtering.
 * 
 * Role priority: admin > editor > reviewer > author > reader
 * 
 * Each role focuses on specific workflows:
 * - Admin: Global platform management, publication, user management
 * - Editor: Editorial workflow, article reviews, reviewer assignments
 * - Reviewer: Assigned reviews, review submission
 * - Author: Own article submissions, revisions
 * - Reader: Public journal browsing
 */

export type DashboardRole = 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';

const ROLE_PRIORITY: Record<DashboardRole, number> = {
  admin: 5,
  editor: 4,
  reviewer: 3,
  author: 2,
  reader: 1,
};

/**
 * Determines the primary (highest priority) role for dashboard display.
 * Used for multi-role users to select the most relevant dashboard view.
 */
export function getPrimaryRole(userRoles: string[]): DashboardRole {
  const validRoles = userRoles.filter((r) => r in ROLE_PRIORITY) as DashboardRole[];
  if (validRoles.length === 0) return 'reader';
  
  let primary = validRoles[0];
  for (let i = 1; i < validRoles.length; i++) {
    const current = validRoles[i];
    if (ROLE_PRIORITY[current] > ROLE_PRIORITY[primary]) {
      primary = current;
    }
  }
  return primary;
}

/**
 * Get role-specific dashboard title.
 */
export function getDashboardTitle(role: DashboardRole): string {
  const titles: Record<DashboardRole, string> = {
    admin: 'Administration Dashboard',
    editor: 'Editorial Dashboard',
    reviewer: 'Review Dashboard',
    author: 'Article Dashboard',
    reader: 'Journal Dashboard',
  };
  return titles[role];
}

/**
 * Get role-specific dashboard description.
 */
export function getDashboardDescription(role: DashboardRole): string {
  const descriptions: Record<DashboardRole, string> = {
    admin: 'Manage platform, users, publications, and settings',
    editor: 'Review and manage submitted articles, assign reviewers',
    reviewer: 'View and submit reviews for assigned articles',
    author: 'Track your submitted articles and revisions',
    reader: 'Explore published journal content',
  };
  return descriptions[role];
}

/**
 * Check if a role string is valid for dashboard filtering.
 */
export function isValidDashboardRole(role: unknown): role is DashboardRole {
  return typeof role === 'string' && role in ROLE_PRIORITY;
}

/**
 * Determine if a specific role should be presented based on user roles and dashboard role.
 */
export function shouldShowForRole(
  targetRole: DashboardRole,
  userRoles: string[],
  dashboardRole: DashboardRole
): boolean {
  // If dashboard role doesn't match a user's role, don't show this target role's content
  if (!userRoles.includes(dashboardRole)) {
    return false;
  }

  // Admin can see admin-specific features
  if (dashboardRole === 'admin' && targetRole === 'admin') {
    return true;
  }

  // Editor can see editor features
  if (dashboardRole === 'editor' && targetRole === 'editor') {
    return true;
  }

  // Reviewer can see reviewer features
  if (dashboardRole === 'reviewer' && targetRole === 'reviewer') {
    return true;
  }

  // Author can see author features
  if (dashboardRole === 'author' && targetRole === 'author') {
    return true;
  }

  // Reader can see public journal
  if (dashboardRole === 'reader' && targetRole === 'reader') {
    return true;
  }

  // Elevated roles (admin, editor) can access reader features
  if ((dashboardRole === 'admin' || dashboardRole === 'editor') && targetRole === 'reader') {
    return true;
  }

  return false;
}

/**
 * Filter workflow items (requires_attention, pending, completed) based on role.
 * 
 * Each role should only see items relevant to their workflow:
 * - Admin: publication, user management, final decisions
 * - Editor: articles needing decision, reviewer assignments, reviews
 * - Reviewer: assigned reviews, pending reviews
 * - Author: submitted articles, revision requests
 * - Reader: public journal items only
 */
export function filterWorkflowItemsByRole(
  items: DashboardItem[],
  dashboardRole: DashboardRole,
  userRoles: string[]
): DashboardItem[] {
  if (!userRoles.includes(dashboardRole)) {
    return [];
  }

  return items.filter((item) => {
    const key = item.key.toLowerCase();

    // Admin sees everything related to admin operations
    if (dashboardRole === 'admin') {
      // Avoid reviewer/author-specific workflows if admin doesn't have those roles
      if (
        (key.includes('review') || key.includes('submission')) &&
        !userRoles.includes('reviewer') &&
        !userRoles.includes('author')
      ) {
        return false;
      }
      return true;
    }

    // Editor sees editorial workflow
    if (dashboardRole === 'editor') {
      // Show articles, reviews, assignments, decisions but not user management or publications
      if (key.includes('user') || key.includes('categor') || key.includes('publication')) {
        return false;
      }
      return true;
    }

    // Reviewer sees only review-related items
    if (dashboardRole === 'reviewer') {
      return key.includes('review') || key.includes('assign');
    }

    // Author sees only article-related items
    if (dashboardRole === 'author') {
      return key.includes('article') || key.includes('submission') || key.includes('revision');
    }

    // Reader sees public journal items only
    if (dashboardRole === 'reader') {
      return key.includes('journal') || key.includes('publish') || key.includes('article');
    }

    return false;
  });
}

/**
 * Configuration for quick action visibility by role.
 */
export interface QuickActionConfig {
  id: string;
  label: string;
  href: string;
  icon: string; // Icon name from lucide-react
  showFor: DashboardRole[];
  hideIfNoOtherRoles?: boolean; // If true and not elevated, don't show
}

export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    id: 'users',
    label: 'User management',
    href: '/users',
    icon: 'Users',
    showFor: ['admin'],
  },
  {
    id: 'categories',
    label: 'Journals & categories',
    href: '/categories',
    icon: 'FolderTree',
    showFor: ['admin'],
  },
  {
    id: 'publications',
    label: 'Publication queue',
    href: '/publications',
    icon: 'LayoutGrid',
    showFor: ['admin', 'editor'],
  },
  {
    id: 'submit-article',
    label: 'Submit article',
    href: '/articles/new',
    icon: 'BookOpen',
    showFor: ['author'],
    hideIfNoOtherRoles: true, // Don't show if only author among elevated roles
  },
  {
    id: 'public-journal',
    label: 'Public journal',
    href: '/journal',
    icon: 'BookOpen',
    showFor: ['reader', 'author', 'reviewer', 'editor', 'admin'],
  },
];

/**
 * Get quick actions that should be shown for the current dashboard role.
 */
export function getVisibleQuickActions(
  dashboardRole: DashboardRole,
  userRoles: string[]
): QuickActionConfig[] {
  const isElevated = userRoles.some((r) => r === 'admin' || r === 'editor');

  return QUICK_ACTIONS.filter((action) => {
    if (!action.showFor.includes(dashboardRole)) {
      return false;
    }

    // "Submit article" should only appear if it's the primary role or user is not staff
    if (action.id === 'submit-article' && action.hideIfNoOtherRoles) {
      return dashboardRole === 'author' && !isElevated;
    }

    return true;
  });
}
