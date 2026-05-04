'use client';

import Link from 'next/link';
import { Download, Users, FileText, ChevronLeft } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  SectionHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  Button,
  ArticleStatusBadge,
  AssignmentStatusBadge,
} from '@/shared/components/ui';
import { useArticle } from '../hooks/useArticle';
import { useArticleVersions } from '../hooks/useArticleVersions';
import { useArticleAssignments } from '../hooks/useArticleAssignments';
import { useArticleDecision } from '../hooks/useArticleDecision';
import { articlesService } from '../services/articles.service';
import type { EditorialDecision } from '../types/Article.types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DecisionBadge({ decision }: { decision: EditorialDecision['decision'] }) {
  const map = {
    accepted:          'bg-green-100 text-green-700',
    rejected:          'bg-red-100 text-red-700',
    revision_required: 'bg-orange-100 text-orange-700',
  } as const;
  const label = {
    accepted: 'Accepted', rejected: 'Rejected', revision_required: 'Revision Required',
  } as const;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[decision]}`}>
      {label[decision]}
    </span>
  );
}

export function ArticleDetailsPage({ id }: { id: number }) {
  const articleQuery = useArticle(id);
  const versionsQuery = useArticleVersions(id);
  const assignmentsQuery = useArticleAssignments(id);
  const decisionQuery = useArticleDecision(id);

  if (articleQuery.isLoading) return <LoadingState rows={5} />;
  if (articleQuery.isError)
    return <ErrorState message="Could not load article." onRetry={() => articleQuery.refetch()} />;

  const article = articleQuery.data!;
  const versions = versionsQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const decision = decisionQuery.data;

  async function handleDownload() {
    const blob = await articlesService.download(id);
    downloadBlob(blob, `article-${id}.pdf`);
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/articles" className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to Articles
        </Link>
      </div>

      <PageHeader
        title={article.title}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownload}>
              Download PDF
            </Button>
            <Link
              href={`/articles/${id}/versions`}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded border border-strong bg-surface text-secondary hover:bg-muted transition-colors"
            >
              <FileText className="w-4 h-4" /> Versions
            </Link>
            <Link
              href={`/articles/${id}/decision`}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              Editorial Decision
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Metadata */}
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-primary">Metadata</h2></CardHeader>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-4 text-sm">
            <div>
              <dt className="text-muted font-medium">Status</dt>
              <dd className="mt-1"><ArticleStatusBadge status={article.status} /></dd>
            </div>
            <div>
              <dt className="text-muted font-medium">Category</dt>
              <dd className="mt-1 text-primary">{article.category?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted font-medium">Author</dt>
              <dd className="mt-1 text-primary">{article.author?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted font-medium">Submitted</dt>
              <dd className="mt-1 text-primary">{new Date(article.created_at).toLocaleDateString()}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted font-medium">Keywords</dt>
              <dd className="mt-1 text-primary">{article.keywords || '—'}</dd>
            </div>
          </dl>
        </Card>

        {/* Abstract */}
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-primary">Abstract</h2></CardHeader>
          <p className="mt-3 text-sm text-secondary leading-relaxed whitespace-pre-wrap">
            {article.abstract}
          </p>
        </Card>

        {/* Editorial Decision */}
        {decision && (
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-primary">Editorial Decision</h2></CardHeader>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted font-medium">Decision:</span>
                <DecisionBadge decision={decision.decision} />
              </div>
              {decision.comments && (
                <p className="text-sm text-secondary whitespace-pre-wrap">{decision.comments}</p>
              )}
              <p className="text-xs text-muted">{new Date(decision.created_at).toLocaleDateString()}</p>
            </div>
          </Card>
        )}

        {/* Reviewer Assignments */}
        <Card>
          <SectionHeader
            title="Reviewer Assignments"
            count={assignments.length}
            action={
              <Link
                href={`/articles/${id}/decision`}
                className="text-sm text-brand-600 hover:underline font-medium flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" /> Manage
              </Link>
            }
          />
          {assignmentsQuery.isLoading && <LoadingState variant="list" rows={3} />}
          {!assignmentsQuery.isLoading && assignments.length === 0 && (
            <EmptyState
              icon={<Users className="w-5 h-5" />}
              title="No reviewers assigned"
              description="Assign reviewers to start the review process."
              className="py-8"
            />
          )}
          {assignments.length > 0 && (
            <ul className="mt-3 divide-y divide-subtle">
              {assignments.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{a.reviewer?.name ?? `Reviewer #${a.reviewer_id}`}</p>
                    <p className="text-xs text-muted">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                  </div>
                  <AssignmentStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Versions */}
        <Card>
          <SectionHeader
            title="Versions"
            count={versions.length}
            action={
              <Link href={`/articles/${id}/versions`} className="text-sm text-brand-600 hover:underline font-medium">
                View all
              </Link>
            }
          />
          {versionsQuery.isLoading && <LoadingState variant="list" rows={2} />}
          {!versionsQuery.isLoading && versions.length === 0 && (
            <p className="mt-3 text-sm text-muted">No additional versions uploaded.</p>
          )}
          {versions.length > 0 && (
            <ul className="mt-3 divide-y divide-subtle">
              {versions.slice(0, 3).map((v) => (
                <li key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Version {v.version_number}</p>
                    {v.change_summary && (
                      <p className="text-xs text-muted">{v.change_summary}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted">{new Date(v.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
