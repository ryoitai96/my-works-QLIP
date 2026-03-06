import type { Metadata } from 'next';
import { UserDetailContent } from '../../../../../features/admin/components/user-detail-content';

export const metadata: Metadata = {
  title: '個人詳細 | My WORKS',
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <UserDetailContent userId={id} />
    </div>
  );
}
