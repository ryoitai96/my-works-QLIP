import type { Metadata } from 'next';
import { MembersPageContent } from '../../../features/members/components/members-page-content';

export const metadata: Metadata = {
  title: '従業員管理 | My WORKS',
};

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffc000]/5 to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">従業員管理</h1>
        <MembersPageContent />
      </div>
    </div>
  );
}
