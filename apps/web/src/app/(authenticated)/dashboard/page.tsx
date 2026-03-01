import type { Metadata } from 'next';

import { DashboardPageContent } from '../../../features/dashboard/components/dashboard-page-content';

export const metadata: Metadata = {
  title: 'ダッシュボード | QLIP',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffc000]/5 to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <DashboardPageContent />
      </div>
    </div>
  );
}
