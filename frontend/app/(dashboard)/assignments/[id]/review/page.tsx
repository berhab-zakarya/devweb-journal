import { ReviewFormPage } from '@/features/assignments/components/ReviewFormPage';

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ReviewFormPage assignmentId={Number(id)} />;
}
