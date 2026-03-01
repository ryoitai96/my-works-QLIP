import type { Metadata } from 'next';

import { SettingsPageContent } from '../../../features/settings/components/settings-page-content';

export const metadata: Metadata = {
  title: '設定 | QLIP',
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">設定</h1>
        <SettingsPageContent />
      </div>
    </div>
  );
}
