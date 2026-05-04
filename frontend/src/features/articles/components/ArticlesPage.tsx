'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import {
  PageHeader,
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
  Pagination,
  TableContainer,
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

export function ArticlesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useArticles({ search: search || undefined, page });

  const articles = data?.data?.data ?? [];
  const total = data?.data?.meta?.total ?? 0;
  const lastPage = data?.data?.meta?.last_page ?? 1;
  const perPage = data?.data?.meta?.per_page ?? 15;

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
          <TableContainer>
            <TableWrapper>
              <TableHead>
                <tr>
                  <Th>Title</Th>
                  <Th>Author</Th>
                  <Th>Category</Th>
                  <Th>Status</Th>
                  <Th>Submitted</Th>
                  <Th> </Th>
                </tr>
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
          </TableContainer>
        )}

        {!isLoading && !isError && total > perPage && (
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
