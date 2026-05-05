'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Button } from '@/shared/components/ui';
import { getErrorMessage } from '@/shared/utils/errors';
import { useArticleReviewerSearch } from '../hooks/useArticleReviewerSearch';
import { useAssignReviewersMutation } from '../mutations/articles.mutations';
import type { ReviewerSearchResult } from '../types/Article.types';
import { ReviewerSearchBox } from './ReviewerSearchBox';
import { SelectedReviewersList } from './SelectedReviewersList';

const assignSchema = z.object({
  due_date: z.string().min(1, 'Due date is required'),
});
type AssignFormData = z.infer<typeof assignSchema>;

export function AssignReviewersForm({ articleId }: Readonly<{ articleId: number }>) {
  const assignReviewers = useAssignReviewersMutation(articleId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedReviewers, setSelectedReviewers] = useState<ReviewerSearchResult[]>([]);
  const [assignError, setAssignError] = useState('');

  const search = useArticleReviewerSearch(articleId, activeQuery);

  const assignForm = useForm<AssignFormData>({ resolver: zodResolver(assignSchema) });

  function runSearch() {
    setActiveQuery(searchQuery.trim());
  }

  function toggleReviewer(r: ReviewerSearchResult) {
    setSelectedReviewers((prev) =>
      prev.some((x) => x.id === r.id) ? prev.filter((x) => x.id !== r.id) : [...prev, r]
    );
  }

  const onAssignSubmit = (data: AssignFormData) => {
    if (selectedReviewers.length === 0) {
      setAssignError('Select at least one reviewer');
      return;
    }
    setAssignError('');
    assignReviewers.mutate(
      { reviewer_ids: selectedReviewers.map((r) => r.id), due_date: data.due_date },
      {
        onSuccess: () => {
          setSelectedReviewers([]);
          setSearchQuery('');
          setActiveQuery('');
          assignForm.reset();
        },
        onError: (error) => setAssignError(getErrorMessage(error)),
      }
    );
  };

  const searching = search.isFetching && activeQuery.length >= 2;
  const searchResults = search.data ?? [];

  return (
    <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} noValidate className="space-y-3">
      {assignError && (
        <div role="alert" className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
          {assignError}
        </div>
      )}

      <ReviewerSearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={runSearch}
        searching={searching}
      />

      <SelectedReviewersList
        selected={selectedReviewers}
        onToggle={toggleReviewer}
        searchResults={activeQuery.length >= 2 ? searchResults : []}
      />

      <div className="flex items-end gap-3">
        <FormField
          id="due_date"
          label="Due Date"
          required
          error={assignForm.formState.errors.due_date?.message}
          className="flex-1"
        >
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
  );
}
