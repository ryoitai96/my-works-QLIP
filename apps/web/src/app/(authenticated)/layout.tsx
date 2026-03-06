import { Header } from '../../components/header';
import { Sidebar } from '../../components/sidebar';
import { AuthGuard } from '../../features/auth/components/auth-guard';
import { RoleGuard } from '../../features/auth/components/role-guard';
import { TenantServicesProvider } from '../../features/auth/tenant-services-context';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard>
        <TenantServicesProvider>
          <div className="h-screen overflow-hidden bg-gray-50 text-gray-900">
            <Header />
            <div className="flex h-screen pt-14">
              <Sidebar />
              <main className="flex flex-1 flex-col overflow-hidden">
                <div className="page-enter flex-1 overflow-y-auto px-6 py-6">{children}</div>
              </main>
            </div>
          </div>
        </TenantServicesProvider>
      </RoleGuard>
    </AuthGuard>
  );
}
