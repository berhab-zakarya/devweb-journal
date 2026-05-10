'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, ChevronLeft, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PageHeader,
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  ErrorState,
  FormField,
  Textarea,
  FileUpload,
  Button,
} from '@/shared/components/ui';
import { getLaravelFieldErrors, getErrorMessage } from '@/shared/utils/errors';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { isReviewer } from '@/shared/auth/permissions';
import { useArticleVersions } from '../hooks/useArticleVersions';
import { useCreateVersionMutation } from '../mutations/articles.mutations';

const schema = z.object({
  change_summary: z.string().trim().optional(),
});
type FormData = z.infer<typeof schema>;

export function ArticleVersionsPage({ id }: Readonly<{ id: number }>) {
  const { data: currentUser } = useCurrentUser();
  const versionsQuery = useArticleVersions(id, { enabled: !isReviewer(currentUser) });
  const createVersion = useCreateVersionMutation(id);
  const versions = versionsQuery.data ?? [];
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (isReviewer(currentUser)) {
    return (
      <div>
        <div className="mb-4">
          <Link href="/assignments" className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
            <ChevronLeft className="w-4 h-4" /> Back to Assignments
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Lock className="w-6 h-6 text-danger" aria-hidden />
          </div>
          <div>
            <h1 className="text-base font-semibold text-primary mb-1">Not Authorized</h1>
            <p className="text-sm text-muted max-w-sm">
              Version history is not available to reviewers. Access the manuscript PDF through
              your assignment workflow.
            </p>
          </div>
          <Link href="/assignments" className="text-sm text-brand-600 hover:underline font-medium">
            Go to My Assignments
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: FormData) => {
    if (!pdfFile) { setPdfError('PDF file is required'); return; }
    setPdfError('');
    setGeneralError('');
    setSuccess(false);
    createVersion.mutate(
      { pdf: pdfFile, change_summary: data.change_summary },
      {
        onSuccess: () => { setSuccess(true); reset(); setPdfFile(null); },
        onError: (error) => {
          const fieldErrors = getLaravelFieldErrors(error);
          if (Object.keys(fieldErrors).length > 0) {
            for (const [field, message] of Object.entries(fieldErrors)) {
              setError(field as keyof FormData, { message });
            }
          } else {
            setGeneralError(getErrorMessage(error));
          }
        },
      }
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link href={`/articles/${id}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to Article
        </Link>
      </div>

      <PageHeader title="Article Versions" description={`Version history for article #${id}`} />

      <div className="space-y-6">
        {/* Version history */}
        <Card padding="none">
          <div className="p-5">
            <CardHeader>
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <History className="w-5 h-5" /> Version History
              </h2>
            </CardHeader>
          </div>

          {versionsQuery.isLoading && <LoadingState variant="list" rows={3} />}
          {versionsQuery.isError && (
            <ErrorState message="Could not load versions." onRetry={() => versionsQuery.refetch()} className="py-8" />
          )}
          {!versionsQuery.isLoading && !versionsQuery.isError && versions.length === 0 && (
            <EmptyState
              icon={<History className="w-6 h-6" />}
              title="No additional versions"
              description="Upload a revised manuscript below to add a new version."
              className="py-12"
            />
          )}
          {versions.length > 0 && (
            <ul className="divide-y divide-subtle">
              {versions.map((v) => (
                <li key={v.id} className="px-5 py-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary">Version {v.version_number}</p>
                    {v.change_summary && (
                      <p className="text-sm text-secondary mt-0.5">{v.change_summary}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap ml-4">
                    {new Date(v.submitted_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Upload new version */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-primary">Upload Revised Manuscript</h2>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-2">
            {generalError && (
              <div role="alert" className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-danger">
                {generalError}
              </div>
            )}
            {success && (
              <div aria-live="polite" className="px-3 py-2.5 rounded-md bg-green-50 border border-green-200 text-sm text-success">
                New version uploaded successfully.
              </div>
            )}

            <FormField id="pdf" label="Revised PDF" required error={pdfError}>
              <FileUpload
                accept=".pdf"
                maxSizeMB={20}
                value={pdfFile}
                onChange={(file) => { setPdfFile(file); setPdfError(''); }}
              />
            </FormField>

            <FormField id="change_summary" label="Change Summary" error={errors.change_summary?.message}>
              <Textarea
                id="change_summary"
                rows={3}
                placeholder="Briefly describe what changed in this version…"
                error={!!errors.change_summary}
                {...register('change_summary')}
              />
            </FormField>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || createVersion.isPending}
              >
                Upload Version
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
