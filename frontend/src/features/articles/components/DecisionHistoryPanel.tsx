'use client';

import type { EditorialDecision } from '../types/Article.types';

export function DecisionHistoryPanel({ history }: Readonly<{ history: EditorialDecision[] }>) {
  if (!history.length) {
    return <p className="text-sm text-muted">No decision history recorded.</p>;
  }
  return (
    <ul className="divide-y divide-subtle border border-subtle rounded-lg">
      {history.map((d) => (
        <li key={d.id} className="px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-primary capitalize">{d.decision.replace(/_/g, ' ')}</span>
            <span className="text-xs text-muted">({d.stage})</span>
            <span className="text-xs text-muted ml-auto">
              {new Date(d.decided_at).toLocaleString()}
            </span>
          </div>
          <p className="text-secondary whitespace-pre-wrap">{d.comments}</p>
        </li>
      ))}
    </ul>
  );
}
