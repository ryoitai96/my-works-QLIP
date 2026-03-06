import type { Metadata } from 'next';

import { ClientDashboardPageContent } from '../../../features/client-dashboard/components/client-dashboard-page-content';

export const metadata: Metadata = {
  title: '企業ダッシュボード | QLIP',
};

export default function ClientDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">企業ダッシュボード</h1>
      <ClientDashboardPageContent />
    </div>
  );
}
