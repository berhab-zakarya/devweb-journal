import { Badge } from './Badge';

export type ArticleStatus =
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'accepted'
  | 'rejected'
  | 'published';

export type AssignmentStatus = 'pending' | 'accepted' | 'decline' | 'complete';

const articleStatusConfig: Record<ArticleStatus, { label: string; className: string }> = {
  submitted:         { label: 'Submitted',         className: 'bg-blue-100   text-blue-700'   },
  under_review:      { label: 'Under Review',      className: 'bg-amber-100  text-amber-700'  },
  revision_required: { label: 'Revision Required', className: 'bg-orange-100 text-orange-700' },
  accepted:          { label: 'Accepted',          className: 'bg-green-100  text-green-700'  },
  rejected:          { label: 'Rejected',          className: 'bg-red-100    text-red-700'    },
  published:         { label: 'Published',         className: 'bg-teal-100   text-teal-700'   },
};

const assignmentStatusConfig: Record<AssignmentStatus, { label: string; className: string }> = {
  pending:  { label: 'Pending',   className: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Accepted',  className: 'bg-green-100 text-green-700' },
  decline:  { label: 'Declined',  className: 'bg-red-100   text-red-700'   },
  complete: { label: 'Completed', className: 'bg-teal-100  text-teal-700'  },
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  const config = articleStatusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const config = assignmentStatusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}

export { articleStatusConfig, assignmentStatusConfig };
