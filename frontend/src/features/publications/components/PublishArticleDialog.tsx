'use client';

import { Button, Modal } from '@/shared/components/ui';
import type { PublicationMetadataFormValues } from './PublicationMetadataForm';
import { toPublishPayload } from './PublicationMetadataForm';

export function PublishArticleDialog({
  open,
  onClose,
  values,
  onConfirm,
  isPending,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  values: PublicationMetadataFormValues | null;
  onConfirm: () => void;
  isPending: boolean;
}>) {
  const payload = values ? toPublishPayload(values) : null;

  return (
    <Modal open={open} onClose={onClose} title="Confirm publication">
      {values && payload && (
        <>
          <div className="space-y-3 text-sm text-secondary mb-6">
            <p className="font-medium text-primary">Review metadata before publishing.</p>
            <dl className="grid grid-cols-1 gap-2 border border-subtle rounded-md p-4 bg-muted/30">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Published at</dt>
                <dd className="text-primary font-medium text-right">{payload.published_at}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">DOI</dt>
                <dd className="text-primary font-medium text-right break-all">{payload.doi}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Volume</dt>
                <dd className="text-primary font-medium">{payload.volume}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Issue</dt>
                <dd className="text-primary font-medium">{payload.issue}</dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={onConfirm} loading={isPending}>
              Publish now
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
