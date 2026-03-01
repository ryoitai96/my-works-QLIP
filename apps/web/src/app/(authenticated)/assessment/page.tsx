import type { Metadata } from 'next';

import { AssessmentPageContent } from '../../../features/assessment/components/assessment-page-content';

export const metadata: Metadata = {
  title: 'アセスメント | QLIP',
};

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffc000]/5 to-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          アセスメント
        </h1>
        <AssessmentPageContent />
      </div>
    </div>
  );
}
