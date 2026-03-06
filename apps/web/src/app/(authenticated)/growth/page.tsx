import type { Metadata } from 'next';

import { GrowthRecordContent } from '../../../features/dashboard/components/growth-record-content';

export const metadata: Metadata = {
  title: 'わたしの成長きろく | QLIP',
};

export default function GrowthPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">わたしの成長きろく</h1>
      <GrowthRecordContent />
    </div>
  );
}
