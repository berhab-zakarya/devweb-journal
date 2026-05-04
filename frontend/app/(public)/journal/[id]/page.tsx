import { PublicationDetailPage } from '@/features/publications/components/PublicationDetailPage';

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <PublicationDetailPage id={Number(id)} />;
}
