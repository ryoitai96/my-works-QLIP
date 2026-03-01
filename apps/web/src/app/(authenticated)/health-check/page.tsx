import type { Metadata } from 'next';

import { HealthCheckPageContent } from '../../../features/health-check/components/health-check-page-content';

export const metadata: Metadata = {
  title: '体調入力 | QLIP',
};

export default function HealthCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffc000]/5 to-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          今日の体調
        </h1>
        <HealthCheckPageContent />
      </div>
    </div>
  );
}
