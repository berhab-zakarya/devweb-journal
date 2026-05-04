import { EditorialDecisionPage } from '@/features/articles/components/EditorialDecisionPage';

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <EditorialDecisionPage id={Number(id)} />;
}
