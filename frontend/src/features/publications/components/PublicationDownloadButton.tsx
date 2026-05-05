'use client';

import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { publicationsService } from '../services/publications.service';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PublicationDownloadButton({
  publicationId,
  label = 'Download PDF',
}: Readonly<{ publicationId: number; label?: string }>) {
  async function handleDownload() {
    const blob = await publicationsService.download(publicationId);
    downloadBlob(blob, `publication-${publicationId}.pdf`);
  }

  return (
    <Button type="button" variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownload}>
      {label}
    </Button>
  );
}
