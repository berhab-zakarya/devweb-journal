'use client';

import Link from 'next/link';
import { Download, FileEdit, FileText, Gavel, Send, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/utils/cn';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import {
  canEditArticleMetadata,
  canPublishArticle,
  canUploadCorrectedVersion,
  isAdmin,
  isEditor,
  isReader,
  isReviewer,
} from '@/shared/auth/permissions';
import { publicationsService } from '@/features/publications/services/publications.service';
import { articlesService } from '../services/articles.service';
import { downloadBlob } from '@/shared/utils/download';
import type { Article, ArticleAssignment } from '../types/Article.types';

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
  const uid = user?.id;

  const admin = isAdmin(user);
  const editor = isEditor(user);
  const reviewer = isReviewer(user);
  const reader = isReader(user);
  const canEditMetadata = canEditArticleMetadata(user, article);
  const canUploadCorrection = canUploadCorrectedVersion(user, article);
  const canPublish = canPublishArticle(user, article);
  const staff = admin || editor;

  const myAssignment = uid ? assignments.find((assignment) => assignment.reviewer_id === uid) : undefined;
  const canViewVersions = staff || canEditMetadata || canUploadCorrection;

  async function handleDownloadPdf() {
    const blob = await articlesService.download(articleId);
    downloadBlob(blob, `article-${articleId}.pdf`);
  }

  async function handleDownloadPublished() {
    const publicationId = article.publication?.id;
    if (!publicationId) return;
    const blob = await publicationsService.download(publicationId);
    downloadBlob(blob, `publication-${publicationId}.pdf`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(staff || canEditMetadata || canUploadCorrection || (reviewer && Boolean(myAssignment))) && (
        <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      )}

      {canViewVersions && (
        <Link href={`/articles/${articleId}/versions`} className={btnSecondary}>
          <FileText className="w-4 h-4 shrink-0" aria-hidden />
          Versions
        </Link>
      )}

      {editor && (
        <Link href={`/articles/${articleId}/decision`} className={btnSecondary}>
          <Users className="w-4 h-4 shrink-0" aria-hidden />
          Manage Editorial Workflow
        </Link>
      )}

      {admin && (
        <Link href={`/articles/${articleId}/decision`} className={btnSecondary}>
          <Gavel className="w-4 h-4 shrink-0" aria-hidden />
          View Decision Context
        </Link>
      )}

      {canPublish && (
        <Link href={`/articles/${articleId}/publish`} className={btnPrimary}>
          Publish
        </Link>
      )}

      {reviewer && myAssignment && (
        <Link href={`/assignments/${myAssignment.id}/review`} className={btnPrimary}>
          <Send className="w-4 h-4 shrink-0" aria-hidden />
          Submit review
        </Link>
      )}

      {canEditMetadata && (
        <Link href={`/articles/${articleId}/edit`} className={btnSecondary}>
          <FileEdit className="w-4 h-4 shrink-0" aria-hidden />
          Edit metadata
        </Link>
      )}

      {canUploadCorrection && (
        <Link href={`/articles/${articleId}/versions`} className={btnSecondary}>
          Upload corrected PDF
        </Link>
      )}

      {reader && article.status === 'published' && article.publication?.id && (
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
