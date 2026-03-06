import type { Metadata } from 'next';
import { MemberCreateContent } from '../../../../features/members/components/member-create-content';

export const metadata: Metadata = {
  title: '新規従業員登録 | My WORKS',
};

export default function MemberNewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">新規従業員登録</h1>
      <MemberCreateContent />
    </div>
  );
}
