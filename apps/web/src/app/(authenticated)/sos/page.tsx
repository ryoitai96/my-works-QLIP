import type { Metadata } from 'next';

import { SosPageContent } from '../../../features/sos/components/sos-page-content';

export const metadata: Metadata = {
  title: 'SOS | QLIP',
};

export default function SosPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">SOS</h1>
      <SosPageContent />
    </div>
  );
}
