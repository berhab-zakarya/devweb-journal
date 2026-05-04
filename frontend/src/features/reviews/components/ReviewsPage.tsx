'use client';

import { Star } from 'lucide-react';
import { PageHeader, Card, EmptyState } from '@/shared/components/ui';

export function ReviewsPage() {
  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Submitted and draft reviews"
      />
      <Card padding="none">
        <EmptyState
          icon={<Star className="w-6 h-6" />}
          title="No reviews yet"
          description="Submitted reviews will appear here."
          className="py-16"
        />
      </Card>
    </div>
  );
}
