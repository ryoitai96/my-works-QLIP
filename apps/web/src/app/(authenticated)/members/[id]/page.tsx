import type { Metadata } from 'next';
import { MemberDetailContent } from '../../../../features/members/components/member-detail-content';

export const metadata: Metadata = {
  title: '従業員詳細 | My WORKS',
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffc000]/5 to-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <MemberDetailContent memberId={id} />
      </div>
    </div>
  );
}
