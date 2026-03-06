import { TenantServicesContent } from '../../../../../../features/admin/components/tenant-services-content';

export default async function TenantServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl">
      <TenantServicesContent tenantId={id} />
    </div>
  );
}
