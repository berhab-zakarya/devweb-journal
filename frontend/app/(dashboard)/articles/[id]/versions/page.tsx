import { ArticleVersionsPage } from '@/features/articles/components/ArticleVersionsPage';

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ArticleVersionsPage id={Number(id)} />;
}
