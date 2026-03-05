import type { Metadata } from 'next';
import { TeamSettingsPageContent } from '../../../../features/client-settings/components/team-settings-page-content';

export const metadata: Metadata = {
  title: 'チーム設定 | 設定 | QLIP',
};

export default function ClientSettingsTeamsPage() {
  return <TeamSettingsPageContent />;
}
