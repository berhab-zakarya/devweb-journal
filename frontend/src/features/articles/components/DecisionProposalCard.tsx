'use client';

import type { EditorialDecision } from '../types/Article.types';
import { Card, CardHeader } from '@/shared/components/ui';

function badge(decision: EditorialDecision['decision']) {
  const m = {
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    revision_required: 'bg-orange-100 text-orange-900',
  } as const;
  return m[decision] ?? 'bg-muted text-secondary';
}

export function DecisionProposalCard({ proposal }: Readonly<{ proposal: EditorialDecision }>) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-primary">Editor proposal</h3>
      </CardHeader>
      <div className="mt-2 space-y-2 text-sm">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge(proposal.decision)}`}>
          {proposal.decision.replace('_', ' ')}
        </span>
        <p className="text-secondary whitespace-pre-wrap">{proposal.comments}</p>
        <p className="text-xs text-muted">{new Date(proposal.decided_at).toLocaleString()}</p>
      </div>
    </Card>
  );
}
