import { ArticleDetailsPage } from '@/features/articles/components/ArticleDetailsPage';

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ArticleDetailsPage id={Number(id)} />;
}
