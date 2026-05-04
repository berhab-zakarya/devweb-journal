import { AssignmentDetailsPage } from '@/features/assignments/components/AssignmentDetailsPage';

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <AssignmentDetailsPage id={Number(id)} />;
}
