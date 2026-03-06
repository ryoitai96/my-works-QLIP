import type { Metadata } from 'next';

import { AssessmentPageContent } from '../../../features/assessment/components/assessment-page-content';

export const metadata: Metadata = {
  title: 'アセスメント | QLIP',
};

export default function AssessmentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">アセスメント</h1>
      <AssessmentPageContent />
    </div>
  );
}
