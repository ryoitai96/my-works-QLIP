import type { Metadata } from 'next';

import { ClientMemberListContent } from '../../../../features/client-dashboard/components/client-member-list-content';

export const metadata: Metadata = {
  title: 'メンバー一覧 | QLIP',
};

export default function ClientMembersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">メンバー一覧</h1>
      <ClientMemberListContent />
    </div>
  );
}
