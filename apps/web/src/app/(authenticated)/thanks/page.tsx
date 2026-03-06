import type { Metadata } from 'next';

import { ThanksPageContent } from '../../../features/thanks/components/thanks-page-content';

export const metadata: Metadata = {
  title: '感謝一覧 | QLIP',
};

export default function ThanksPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Thanks</h1>
      <ThanksPageContent />
    </div>
  );
}
