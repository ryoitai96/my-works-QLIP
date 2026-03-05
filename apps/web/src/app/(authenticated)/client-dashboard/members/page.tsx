import type { Metadata } from 'next';

import { ClientMemberListContent } from '../../../../features/client-dashboard/components/client-member-list-content';

export const metadata: Metadata = {
  title: 'メンバー一覧 | QLIP',
};

export default function ClientMembersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffc000]/5 to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">メンバー一覧</h1>
        <ClientMemberListContent />
      </div>
    </div>
  );
}
