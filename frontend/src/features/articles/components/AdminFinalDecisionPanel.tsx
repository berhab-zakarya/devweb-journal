'use client';

/**
 * API reality (see backend EditorialDecisionController): GET returns `latest_proposal: null` always;
 * POST /articles/{id}/decision is editor-only and writes a single `finale` decision row.
 * There is **no** separate administrator “validate proposal” endpoint — admins cannot POST this route.
 * This panel is read-only context for staff; final validation workflow must be coordinated outside this API
 * or requires future backend support.
 */
import Link from 'next/link';
import type { EditorialDecisionResponse } from '../types/Article.types';
import { Card, CardHeader } from '@/shared/components/ui';
import { DecisionHistoryPanel } from './DecisionHistoryPanel';
import { DecisionProposalCard } from './DecisionProposalCard';

export function AdminFinalDecisionPanel({
  articleId,
  decision,
}: Readonly<{
  articleId: number;
  decision: EditorialDecisionResponse | undefined;
}>) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-primary">Final decision (admin view)</h2>
      </CardHeader>
      <p className="text-sm text-muted mb-4">
        Use this section to review the same decision data as editors. There is no separate “validate” API
        call for administrators on this project.
      </p>
      {decision?.latest_proposal && <DecisionProposalCard proposal={decision.latest_proposal} />}
      {decision?.latest && (
        <div className="mb-4 text-sm">
          <p className="font-medium text-primary">Current finale decision</p>
          <p className="text-secondary mt-1 capitalize">{decision.latest.decision.replaceAll('_', ' ')}</p>
        </div>
      )}
      <DecisionHistoryPanel history={decision?.history ?? []} />
      <p className="mt-4 text-sm">
        <Link href={`/articles/${articleId}`} className="text-brand-600 font-medium hover:underline">
          Open article details
        </Link>
      </p>
    </Card>
  );
}
