'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { AppError } from '@/shared/errors/app.error';
import { articlesService } from '../services/articles.service';
import { downloadBlob, safeFilename } from '@/shared/utils/download';

interface DownloadPdfButtonProps {
  articleId: number;
  articleTitle?: string | null;
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'secondary';
}

export function DownloadPdfButton({
  articleId,
  articleTitle,
  label = 'Download Manuscript PDF',
  size = 'sm',
  variant = 'secondary',
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const blob = await articlesService.download(articleId);
      downloadBlob(blob, safeFilename(articleId, articleTitle));
    } catch (err) {
      if (err instanceof AppError) {
        if (err.isForbidden) {
          setError('You do not have permission to download this manuscript.');
        } else if (err.isNotFound) {
          setError('The manuscript PDF is not available.');
        } else {
          setError('Download failed. Please try again.');
        }
      } else {
        setError('Download failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant={variant}
        size={size}
        leftIcon={<Download className="w-4 h-4" />}
        loading={loading}
        onClick={handleClick}
      >
        {label}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
