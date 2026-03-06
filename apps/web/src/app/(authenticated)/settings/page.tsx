import type { Metadata } from 'next';

import { SettingsPageContent } from '../../../features/settings/components/settings-page-content';

export const metadata: Metadata = {
  title: '設定 | QLIP',
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">設定</h1>
      <SettingsPageContent />
    </div>
  );
}
