import { PublishArticlePage } from '@/features/publications/components/PublishArticlePage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return null;
  }
  return <PublishArticlePage articleId={numericId} />;
}
