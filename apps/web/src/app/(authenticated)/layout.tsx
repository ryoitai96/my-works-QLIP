import { Header } from '../../components/header';
import { Sidebar } from '../../components/sidebar';
import { TenantServicesProvider } from '../../features/auth/tenant-services-context';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantServicesProvider>
      <div className="h-screen overflow-hidden bg-gray-50 text-gray-900">
        <Header />
        <div className="flex h-[calc(100vh-3.5rem)] pt-14">
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="page-enter flex-1 overflow-y-auto">{children}</div>
          </main>
        </div>
      </div>
    </TenantServicesProvider>
  );
}
