'use client';

/**
 * Presentation-only timeline: there is no dedicated timeline API. Steps are inferred from
 * `Article.status`, `status_history`, and reviewer assignments.
 */
import type { Article, ArticleAssignment, ArticleStatus } from '../types/Article.types';

const STEP_LABELS = [
  'Submitted',
  'Assigned to reviewers',
  'Under review',
  'Review completed',
  'Decision proposed',
  'Final decision',
  'Revision requested',
  'Corrected version submitted',
  'Published',
] as const;

function assignmentPhase(assignments: ArticleAssignment[]): 'none' | 'active' | 'reviews_done' {
  if (assignments.length === 0) return 'none';
  const allComplete = assignments.every((a) => a.status === 'complete' || a.status === 'decline');
  const anyWorking = assignments.some((a) => a.status === 'pending' || a.status === 'accepted');
  if (allComplete) return 'reviews_done';
  if (anyWorking) return 'active';
  return 'active';
}

function deriveCurrentStep(
  status: ArticleStatus,
  assignments: ArticleAssignment[],
  versionCount: number
): number {
  if (status === 'published') return 8;

  const phase = assignmentPhase(assignments);

  if (status === 'submitted') {
    if (assignments.length > 0) return 1;
    return 0;
  }

  if (status === 'under_review') {
    if (phase === 'none') return 1;
    if (phase === 'active') return 2;
    return 3;
  }

  if (status === 'revision_required') {
    if (versionCount > 1) return 7;
    return 6;
  }

  if (status === 'accepted') return 8;

  if (status === 'rejected') return 5;

  return 0;
}

export function ArticleWorkflowTimeline({
  article,
  assignments,
  versionCount,
}: Readonly<{
  article: Article;
  assignments: ArticleAssignment[];
  versionCount: number;
}>) {
  const current = deriveCurrentStep(article.status, assignments, versionCount);
  const isPublished = article.status === 'published' || article.is_published;

  return (
    <div className="border border-subtle rounded-lg p-4 bg-muted/20">
      <h3 className="text-sm font-semibold text-primary mb-4">Workflow</h3>
      <ol className="space-y-3">
        {STEP_LABELS.map((label, index) => {
          const done = isPublished || index < current;
          const active = !isPublished && index === current;
          const pending = !done && !active;
          return (
            <li
              key={label}
              className={`flex items-start gap-3 text-sm ${
                active ? 'font-semibold text-primary' : pending ? 'text-muted' : 'text-secondary'
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-green-100 text-green-800'
                    : active
                      ? 'bg-brand-600 text-inverse'
                      : 'bg-muted text-muted border border-subtle'
                }`}
              >
                {done ? '✓' : index + 1}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
