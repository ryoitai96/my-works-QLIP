'use client';

import { authStore } from '../../auth/auth-store';
import { isStaffRole, isSuperAdmin } from '../../auth/role-check';
import { AccountSettingsSection } from './account-settings-section';
import { SiteSettingsSection } from './site-settings-section';
import { TenantSettingsSection } from './tenant-settings-section';

export function SettingsPageContent() {
  const user = authStore.getUser();
  const hasPermission = user?.role && isStaffRole(user.role);
  const showTenant = user?.role ? isSuperAdmin(user.role) : false;

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-8">
        <p className="text-amber-800">この機能を利用する権限がありません。管理者にお問い合わせください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccountSettingsSection />
      <SiteSettingsSection />
      {showTenant && <TenantSettingsSection />}
    </div>
  );
}
