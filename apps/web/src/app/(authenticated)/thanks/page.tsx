import type { Metadata } from 'next';

import { ThanksPageContent } from '../../../features/thanks/components/thanks-page-content';

export const metadata: Metadata = {
  title: '感謝一覧 | QLIP',
};

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">My Thanks</h1>
        <ThanksPageContent />
      </div>
    </div>
  );
}
