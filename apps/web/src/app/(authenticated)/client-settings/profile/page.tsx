import type { Metadata } from 'next';
import { ClientProfilePageContent } from '../../../../features/client-settings/components/client-profile-page-content';

export const metadata: Metadata = {
  title: '企業プロフィール | 設定 | QLIP',
};

export default function ClientSettingsProfilePage() {
  return <ClientProfilePageContent />;
}
