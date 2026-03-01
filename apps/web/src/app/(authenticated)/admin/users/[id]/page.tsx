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
    <div className="min-h-screen bg-gradient-to-b from-[#ffc000]/5 to-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <UserDetailContent userId={id} />
      </div>
    </div>
  );
}
