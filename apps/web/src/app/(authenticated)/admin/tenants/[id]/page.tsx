import type { Metadata } from 'next';
import { TenantDetailContent } from '../../../../../features/admin/components/tenant-detail-content';

export const metadata: Metadata = {
  title: '企業詳細 | My WORKS',
};

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <TenantDetailContent tenantId={id} />
    </div>
  );
}
