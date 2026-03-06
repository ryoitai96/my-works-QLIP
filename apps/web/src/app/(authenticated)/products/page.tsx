import type { Metadata } from 'next';
import { ProductsPageContent } from '../../../features/products/components/products-page-content';

export const metadata: Metadata = {
  title: '商品管理 | My WORKS',
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">商品管理</h1>
      <ProductsPageContent />
    </div>
  );
}
