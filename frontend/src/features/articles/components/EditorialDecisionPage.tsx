'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Users, Plus, Trash2 } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  LoadingState,
  ErrorState,
  FormField,
  Select,
  Textarea,
  Button,
  AssignmentStatusBadge,
} from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useArticle } from '../hooks/useArticle';
import { useArticleAssignments } from '../hooks/useArticleAssignments';
import { useArticleDecision } from '../hooks/useArticleDecision';
import { useCreateDecisionMutation, useAssignReviewersMutation, useDeleteAssignmentMutation } from '../mutations/articles.mutations';
import { articlesService } from '../services/articles.service';
import type { DecisionType, ReviewerSearchResult } from '../types/Article.types';

const decisionSchema = z.object({
  decision: z.enum(['accepted', 'rejected', 'revision_required'], {
    errorMap: () => ({ message: 'Please select a decision' }),
  }),
  comments: z.string().min(1, 'Comments are required'),
});
type DecisionFormData = z.infer<typeof decisionSchema>;

const assignSchema = z.object({
  due_date: z.string().min(1, 'Due date is required'),
});
type AssignFormData = z.infer<typeof assignSchema>;

const DECISION_OPTIONS: { value: DecisionType; label: string }[] = [
  { value: 'accepted',          label: 'Accept' },
  { value: 'rejected',          label: 'Reject' },
  { value: 'revision_required', label: 'Request Revision' },
];

export function EditorialDecisionPage({ id }: Readonly<{ id: number }>) {
  const router = useRouter();
  const articleQuery = useArticle(id);
  const assignmentsQuery = useArticleAssignments(id);
  const decisionQuery = useArticleDecision(id);
  const createDecision = useCreateDecisionMutation(id);
  const assignReviewers = useAssignReviewersMutation(id);
  const deleteAssignment = useDeleteAssignmentMutation(id);

  // Reviewer search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReviewerSearchResult[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<ReviewerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [decisionError, setDecisionError] = useState('');
  const [assignError, setAssignError] = useState('');

  const decisionForm = useForm<DecisionFormData>({ resolver: zodResolver(decisionSchema) });
  const assignForm = useForm<AssignFormData>({ resolver: zodResolver(assignSchema) });

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await articlesService.searchReviewers(id, searchQuery, 10);
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  }

  function toggleReviewer(r: ReviewerSearchResult) {
    setSelectedReviewers((prev) =>
      prev.some((x) => x.id === r.id) ? prev.filter((x) => x.id !== r.id) : [...prev, r]
    );
  }

  const onAssignSubmit = (data: AssignFormData) => {
    if (selectedReviewers.length === 0) { setAssignError('Select at least one reviewer'); return; }
    setAssignError('');
    assignReviewers.mutate(
      { reviewer_ids: selectedReviewers.map((r) => r.id), due_date: data.due_date },
      {
        onSuccess: () => {
          setSelectedReviewers([]);
          setSearchResults([]);
          setSearchQuery('');
          assignForm.reset();
        },
        onError: (error) => setAssignError(getErrorMessage(error)),
      }
    );
  };

  const onDecisionSubmit = (data: DecisionFormData) => {
    setDecisionError('');
    createDecision.mutate(data, {
      onSuccess: () => router.push(`/articles/${id}`),
      onError: (error) => {
        const fieldErrors = getLaravelFieldErrors(error);
        if (Object.keys(fieldErrors).length > 0) {
          for (const [field, message] of Object.entries(fieldErrors)) {
            decisionForm.setError(field as keyof DecisionFormData, { message });
          }
        } else {
          setDecisionError(getErrorMessage(error));
        }
      },
    });
  };

  if (articleQuery.isLoading) return <LoadingState rows={4} />;
  if (articleQuery.isError) return <ErrorState message="Could not load article." onRetry={() => articleQuery.refetch()} />;

  const article = articleQuery.data!;
  const assignments = assignmentsQuery.data ?? [];
  const decision = decisionQuery.data;

  return (
    <div>
      <div className="mb-4">
        <Link href={`/articles/${id}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to Article
        </Link>
      </div>

      <PageHeader
        title="Editorial Decision"
        description={article.title}
      />

      <div className="space-y-6">
        {/* Assign Reviewers */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Users className="w-5 h-5" /> Assign Reviewers
            </h2>
          </CardHeader>

          {/* Current assignments */}
          {assignmentsQuery.isLoading && <LoadingState variant="list" rows={2} />}
          {assignments.length > 0 && (
            <ul className="mb-4 divide-y divide-subtle">
              {assignments.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{a.reviewer?.name ?? `Reviewer #${a.reviewer_id}`}</p>
                    {a.due_date && <p className="text-xs text-muted">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <AssignmentStatusBadge status={a.status} />
                    <button
                      type="button"
                      onClick={() => deleteAssignment.mutate(a.id)}
                      className="p-1.5 rounded text-muted hover:text-danger hover:bg-red-50 transition-colors"
                      aria-label="Remove assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Reviewer search + assign form */}
          <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} noValidate className="space-y-3">
            {assignError && (
              <div role="alert" className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
                {assignError}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                placeholder="Search reviewers by name or email…"
                className="flex-1 h-10 px-3 text-sm border border-strong rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-primary"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleSearch} loading={searching}>
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <ul className="border border-subtle rounded-lg divide-y divide-subtle max-h-48 overflow-y-auto">
                {searchResults.map((r) => {
                  const selected = selectedReviewers.some((x) => x.id === r.id);
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => toggleReviewer(r)}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                          selected ? 'bg-brand-50 text-brand-700' : 'hover:bg-muted text-primary'
                        }`}
                      >
                        <span>
                          <span className="font-medium">{r.name}</span>
                          <span className="text-muted ml-2">{r.email}</span>
                        </span>
                        {selected && <Plus className="w-4 h-4 rotate-45 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {selectedReviewers.length > 0 && (
              <p className="text-sm text-secondary">
                Selected: {selectedReviewers.map((r) => r.name).join(', ')}
              </p>
            )}

            <div className="flex items-end gap-3">
              <FormField id="due_date" label="Due Date" required error={assignForm.formState.errors.due_date?.message} className="flex-1">
                <input
                  id="due_date"
                  type="date"
                  className="w-full h-10 px-3 text-sm border border-strong rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-primary"
                  {...assignForm.register('due_date')}
                />
              </FormField>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={assignReviewers.isPending}
                className="mb-0.5"
              >
                Assign
              </Button>
            </div>
          </form>
        </Card>

        {/* Editorial Decision Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-primary">Record Decision</h2>
          </CardHeader>

          {decision ? (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted">A decision has already been recorded for this article.</p>
              <p className="text-sm text-secondary">
                <span className="font-medium">Decision:</span>{' '}
                {DECISION_OPTIONS.find((o) => o.value === decision.latest?.decision)?.label ?? decision.latest?.decision}
              </p>
              {decision.latest?.comments && (
                <p className="text-sm text-secondary whitespace-pre-wrap">{decision.latest.comments}</p>
              )}
            </div>
          ) : (
            <form onSubmit={decisionForm.handleSubmit(onDecisionSubmit)} noValidate className="space-y-4 mt-2">
              {decisionError && (
                <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
                  {decisionError}
                </div>
              )}

              <FormField id="decision" label="Decision" required error={decisionForm.formState.errors.decision?.message}>
                <Select
                  id="decision"
                  error={!!decisionForm.formState.errors.decision}
                  {...decisionForm.register('decision')}
                >
                  <option value="">Select a decision…</option>
                  {DECISION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FormField>

              <FormField id="comments" label="Comments" required error={decisionForm.formState.errors.comments?.message}>
                <Textarea
                  id="comments"
                  rows={4}
                  placeholder="Provide feedback and reasoning for your decision…"
                  error={!!decisionForm.formState.errors.comments}
                  {...decisionForm.register('comments')}
                />
              </FormField>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={decisionForm.formState.isSubmitting || createDecision.isPending}
                >
                  Submit Decision
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
