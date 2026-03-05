import type { Metadata } from 'next';

import { ProductionOrderList } from '../../../features/production/components/production-order-list';

export const metadata: Metadata = {
  title: '注文管理 | QLIP',
};

export default function ProductionPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">注文管理</h1>
        <ProductionOrderList />
      </div>
    </div>
  );
}
