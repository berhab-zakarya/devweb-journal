import type { User } from '@/features/auth/types/Auth.types';
import type { Article } from '@/features/articles/types/Article.types';
import type { Assignment } from '@/features/assignments/types/Assignment.types';

export function isAdmin(user?: User | null): boolean {
  return Boolean(user?.roles.includes('admin'));
}

export function isEditor(user?: User | null): boolean {
  return Boolean(user?.roles.includes('editor'));
}

export function isReviewer(user?: User | null): boolean {
  return Boolean(user?.roles.includes('reviewer'));
}

export function isAuthor(user?: User | null): boolean {
  return Boolean(user?.roles.includes('author'));
}

export function isReader(user?: User | null): boolean {
  return Boolean(user?.roles.includes('reader'));
}

export function isArticleOwner(user: User | null | undefined, article?: Article | null): boolean {
  return Boolean(user && article && user.id === article.author_id);
}

export function canViewArticleDecision(user: User | null | undefined, article?: Article | null): boolean {
  return isEditor(user) || isAdmin(user) || (isAuthor(user) && isArticleOwner(user, article));
}

export function canAssignReviewers(user: User | null | undefined): boolean {
  return isEditor(user);
}

export function canRecordEditorialDecision(user: User | null | undefined): boolean {
  return isEditor(user);
}

export function canViewPeerReviews(user: User | null | undefined): boolean {
  return isEditor(user) || isAdmin(user);
}

export function canViewReviewerAssignments(user: User | null | undefined): boolean {
  return isEditor(user) || isAdmin(user);
}

export function canManageReviewerAssignments(user: User | null | undefined): boolean {
  return isEditor(user);
}

export function canViewAuthorDecision(user: User | null | undefined, article?: Article | null): boolean {
  return isAuthor(user) && isArticleOwner(user, article);
}

export function canEditArticleMetadata(user: User | null | undefined, article?: Article | null): boolean {
  return canViewAuthorDecision(user, article) && Boolean(article && (article.status === 'submitted' || article.status === 'revision_required'));
}

export function canUploadCorrectedVersion(user: User | null | undefined, article?: Article | null): boolean {
  return canViewAuthorDecision(user, article) && article?.status === 'revision_required';
}

export function canPublishArticle(user: User | null | undefined, article?: Article | null): boolean {
  if (!article) return false;
  return (isAdmin(user) || isEditor(user)) && article.status === 'accepted' && !article.publication;
}

/** Authors (and admins/editors) can submit new articles; reviewers cannot. */
export function canSubmitArticle(user: User | null | undefined): boolean {
  return isAuthor(user) || isEditor(user) || isAdmin(user);
}

/** Reviewers (and editors/admins) can access their assigned reviews. */
export function canViewAssignedReviews(user: User | null | undefined): boolean {
  return isReviewer(user) || isEditor(user) || isAdmin(user);
}

/** A reviewer can submit a review for an assignment that belongs to them. */
export function canSubmitReview(user: User | null | undefined): boolean {
  return isReviewer(user);
}

// ─── Assignment-scoped permission helpers ────────────────────────────────────

/** True when the current user is the reviewer who owns this specific assignment. */
export function isAssignmentOwner(
  user: User | null | undefined,
  assignment: Assignment | null | undefined,
): boolean {
  return isReviewer(user) && !!user && !!assignment && assignment.reviewer_id === user.id;
}

/**
 * True only when: user is a reviewer, owns this assignment, and it is pending.
 * Both Accept and Decline require this exact predicate.
 */
export function canRespondToAssignment(
  user: User | null | undefined,
  assignment: Assignment | null | undefined,
): boolean {
  return isAssignmentOwner(user, assignment) && assignment?.status === 'pending';
}

/** Alias — acceptance uses the same predicate as any respond action. */
export const canAcceptAssignment = canRespondToAssignment;

/** Alias — declining uses the same predicate as any respond action. */
export const canDeclineAssignment = canRespondToAssignment;

/**
 * True only when: user is a reviewer, owns this assignment, and it is accepted.
 * Ensures a reviewer cannot submit a review before accepting or after completing.
 */
export function canSubmitAssignmentReview(
  user: User | null | undefined,
  assignment: Assignment | null | undefined,
): boolean {
  return isAssignmentOwner(user, assignment) && assignment?.status === 'accepted';
}

/**
 * True when the reviewer who owns the assignment can view the submitted review,
 * or when an editor/admin views it for editorial workflow.
 */
export function canViewAssignmentReview(
  user: User | null | undefined,
  assignment: Assignment | null | undefined,
): boolean {
  if (isAssignmentOwner(user, assignment) && assignment?.status === 'complete') return true;
  return isEditor(user) || isAdmin(user);
}

/**
 * Reviewers can download the manuscript for their own pending/accepted assignments.
 * Editors and admins can always download manuscripts for editorial workflow.
 */
export function canDownloadAssignedManuscript(
  user: User | null | undefined,
  assignment: Assignment | null | undefined,
): boolean {
  if (!assignment) return false;
  if (isAssignmentOwner(user, assignment)) {
    return assignment.status === 'pending' || assignment.status === 'accepted';
  }
  return isEditor(user) || isAdmin(user);
}
