import type { Metadata } from 'next';
import { ClientMembersPageContent } from '../../../../features/client-settings/components/client-members-page-content';

export const metadata: Metadata = {
  title: 'ユーザー管理 | 設定 | QLIP',
};

export default function ClientSettingsMembersPage() {
  return <ClientMembersPageContent />;
}
