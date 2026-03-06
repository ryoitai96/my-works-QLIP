import type { Metadata } from 'next';
import { OrdersPageContent } from '../../../features/orders/components/orders-page-content';

export const metadata: Metadata = {
  title: '花を注文 | My WORKS',
};

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">花を注文</h1>
      <OrdersPageContent />
    </div>
  );
}
