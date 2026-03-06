import type { Metadata } from 'next';
import { SiteListContent } from '../../../features/sites/components/site-list-content';

export const metadata: Metadata = {
  title: '拠点管理 | My WORKS',
};

export default function SitesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">拠点管理</h1>
      <SiteListContent />
    </div>
  );
}
