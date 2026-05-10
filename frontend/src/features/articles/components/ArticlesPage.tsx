'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, ClipboardCheck } from 'lucide-react';
import {
  PageHeader,
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
  Pagination,
  TableFilterBar,
  TableWrapper,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  ArticleStatusBadge,
} from '@/shared/components/ui';
import { useArticles } from '../hooks/useArticles';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export function ArticlesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: currentUser } = useCurrentUser();

  // Reviewer-only: has reviewer role but NOT editor or admin.
  // Such users should not see the article list — their workflow is /assignments.
  const isReviewerOnly =
    Boolean(currentUser?.roles?.includes('reviewer')) &&
    !currentUser?.roles?.some((r) => ['editor', 'admin'].includes(r));

  // Show role-aware block immediately — no API call needed for reviewer-only.
  if (isReviewerOnly) {
    return (
      <div>
        <PageHeader
          title="Articles"
          description="Manage and track submitted articles"
        />
        <Card>
          <div className="py-14 flex flex-col items-center text-center gap-4 px-6">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-primary">Reviewers work through assigned reviews</p>
              <p className="text-sm text-muted mt-1 max-w-xs">
                Article lists are not part of the reviewer workflow. Open your
                assignments to find the articles you need to review.
              </p>
            </div>
            <Link
              href="/assignments"
              className="inline-flex items-center gap-2 h-9 px-4 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              Go to My Assignments
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <ArticlesTable search={search} setSearch={setSearch} page={page} setPage={setPage} />;
}

// Split into a sub-component so the hook only fires for non-reviewer roles.
function ArticlesTable({
  search,
  setSearch,
  page,
  setPage,
}: {
  search: string;
  setSearch: (v: string) => void;
  page: number;
  setPage: (v: number) => void;
}) {
  const { data, isLoading, isError, refetch } = useArticles({ search: search || undefined, page });

  const articles = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? articles.length;
  const lastPage = meta?.last_page ?? 1;
  const perPage = meta?.per_page ?? (articles.length || 15);

  return (
    <div>
      <PageHeader
        title="Articles"
        description="Manage and track submitted articles"
        action={
          <Link
            href="/articles/new"
            className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Article
          </Link>
        }
      />

      <Card padding="none">
        <TableFilterBar>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search articles…"
          />
        </TableFilterBar>

        {isLoading && <LoadingState variant="table" rows={6} />}

        {isError && (
          <ErrorState message="Could not load articles." onRetry={() => refetch()} className="py-12" />
        )}

        {!isLoading && !isError && articles.length === 0 && (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="No articles found"
            description={search ? 'Try a different search term.' : 'Submitted articles will appear here.'}
            className="py-16"
          />
        )}

        {!isLoading && !isError && articles.length > 0 && (
          <TableWrapper>
            <TableHead>
              <Th>Title</Th>
              <Th>Author</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Submitted</Th>
              <Th> </Th>
            </TableHead>
            <TableBody>
              {articles.map((article) => (
                <Tr key={article.id}>
                  <Td className="max-w-xs">
                    <p className="font-medium text-primary truncate">{article.title}</p>
                    {article.keywords && (
                      <p className="text-xs text-muted mt-0.5 truncate">{article.keywords}</p>
                    )}
                  </Td>
                  <Td>{article.author?.name ?? '—'}</Td>
                  <Td>{article.category?.name ?? '—'}</Td>
                  <Td>
                    <ArticleStatusBadge status={article.status} />
                  </Td>
                  <Td className="text-muted text-sm">
                    {new Date(article.created_at).toLocaleDateString()}
                  </Td>
                  <Td>
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-sm text-brand-600 hover:underline font-medium"
                    >
                      View
                    </Link>
                  </Td>
                </Tr>
              ))}
            </TableBody>
          </TableWrapper>
        )}

        {!isLoading && !isError && meta && total > perPage && (
          <div className="px-4 py-3 border-t border-subtle">
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              from={(page - 1) * perPage + 1}
              to={Math.min(page * perPage, total)}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
