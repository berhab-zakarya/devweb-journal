'use client';

import {
  TableContainer,
  TableWrapper,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
} from '@/shared/components/ui';
import type { ArticleReview } from '@/features/articles/types/Article.types';
import { ReviewRecommendationBadge } from './ReviewRecommendationBadge';
import { ReviewStatusBadge } from './ReviewStatusBadge';

export function ReviewsTable({
  reviews,
  onRowClick,
}: Readonly<{
  reviews: ArticleReview[];
  onRowClick?: (r: ArticleReview) => void;
}>) {
  return (
    <TableContainer>
      <TableWrapper>
        <TableHead>
          <tr>
            <Th>Reviewer</Th>
            <Th>Recommendation</Th>
            <Th>Status</Th>
            <Th>Updated</Th>
          </tr>
        </TableHead>
        <TableBody>
          {reviews.map((r) => (
            <Tr
              key={r.id}
              className={onRowClick ? 'cursor-pointer hover:bg-muted/40' : undefined}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
            >
              <Td className="font-medium text-primary">
                {r.assignment?.reviewer?.name ?? `#${r.assignment?.reviewer_id ?? '?'}`}
              </Td>
              <Td>
                <ReviewRecommendationBadge recommendation={r.recommendation} />
              </Td>
              <Td>
                <ReviewStatusBadge isDraft={r.is_draft} isSubmitted={r.is_submitted} />
              </Td>
              <Td className="text-muted text-sm">{new Date(r.updated_at).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </TableBody>
      </TableWrapper>
    </TableContainer>
  );
}
