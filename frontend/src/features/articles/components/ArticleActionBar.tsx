'use client';

import Link from 'next/link';
import { Download, FileEdit, FileText, Gavel, Send, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/utils/cn';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { publicationsService } from '@/features/publications/services/publications.service';
import { articlesService } from '../services/articles.service';
import type { Article, ArticleAssignment } from '../types/Article.types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const btnSecondary = cn(
  'inline-flex items-center justify-center gap-2 rounded font-primary font-medium transition-colors duration-150',
  'h-9 px-3 text-sm',
  'bg-surface text-secondary border border-strong hover:bg-muted',
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1'
);

const btnPrimary = cn(
  'inline-flex items-center justify-center gap-2 rounded font-primary font-semibold transition-colors duration-150',
  'h-9 px-3 text-sm',
  'bg-brand-600 text-inverse hover:bg-brand-700',
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1'
);

export function ArticleActionBar({
  articleId,
  article,
  assignments,
}: Readonly<{
  articleId: number;
  article: Article;
  assignments: ArticleAssignment[];
}>) {
  const { data: user } = useCurrentUser();
  const roles = user?.roles ?? [];
  const uid = user?.id;

  const isAdmin = roles.includes('admin');
  const isEditor = roles.includes('editor');
  const isReviewer = roles.includes('reviewer');
  const isAuthor = roles.includes('author');
  const isReader =
    roles.includes('reader') && !roles.some((r) => ['admin', 'editor', 'author', 'reviewer'].includes(r));

  const myAssignment = uid ? assignments.find((a) => a.reviewer_id === uid) : undefined;

  async function handleDownloadPdf() {
    const blob = await articlesService.download(articleId);
    downloadBlob(blob, `article-${articleId}.pdf`);
  }

  async function handleDownloadPublished() {
    const pubId = article.publication?.id;
    if (!pubId) return;
    const blob = await publicationsService.download(pubId);
    downloadBlob(blob, `publication-${pubId}.pdf`);
  }

  const staff = isAdmin || isEditor;
  const canPublish = staff && article.status === 'accepted' && !article.publication;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(staff || (isAuthor && article.author_id === uid)) && (
        <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      )}

      <Link href={`/articles/${articleId}/versions`} className={btnSecondary}>
        <FileText className="w-4 h-4 shrink-0" aria-hidden />
        Versions
      </Link>

      {staff && (
        <Link href={`/articles/${articleId}/decision`} className={btnSecondary}>
          <Users className="w-4 h-4 shrink-0" aria-hidden />
          Editorial workflow
        </Link>
      )}

      {isEditor && (
        <Link href={`/articles/${articleId}/decision`} className={btnSecondary}>
          <Gavel className="w-4 h-4 shrink-0" aria-hidden />
          Assign / decide / reviews
        </Link>
      )}

      {isAdmin && (
        <Link href={`/articles/${articleId}/decision`} className={btnSecondary}>
          <Gavel className="w-4 h-4 shrink-0" aria-hidden />
          Decision context
        </Link>
      )}

      {canPublish && (
        <Link href={`/articles/${articleId}/publish`} className={btnPrimary}>
          Publish
        </Link>
      )}

      {isReviewer && myAssignment && (
        <Link href={`/assignments/${myAssignment.id}/review`} className={btnPrimary}>
          <Send className="w-4 h-4 shrink-0" aria-hidden />
          Submit review
        </Link>
      )}

      {isAuthor && article.author_id === uid && (
        <>
          <Link href={`/articles/${articleId}/edit`} className={btnSecondary}>
            <FileEdit className="w-4 h-4 shrink-0" aria-hidden />
            Edit metadata
          </Link>
          <Link href={`/articles/${articleId}/versions`} className={btnSecondary}>
            Upload corrected PDF
          </Link>
          <Link href={`/articles/${articleId}/decision`} className={btnSecondary}>
            Editorial decision
          </Link>
        </>
      )}

      {isReader && article.status === 'published' && article.publication?.id && (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleDownloadPublished}
        >
          Download published PDF
        </Button>
      )}
    </div>
  );
}
