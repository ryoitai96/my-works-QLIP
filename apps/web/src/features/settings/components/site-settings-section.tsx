'use client';

import { useEffect, useState } from 'react';
import { fetchSites, updateSite, type SiteInfo } from '../api';
import { isSuperAdmin } from '../../auth/role-check';
import { authStore } from '../../auth/auth-store';

const SITE_TYPE_LABELS: Record<string, string> = {
  flower_lab: 'フラワーラボ',
  satellite_office: 'サテライトオフィス',
  remote: 'リモート',
};

export function SiteSettingsSection() {
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const user = authStore.getUser();
  const canEdit = user?.role ? isSuperAdmin(user.role) : false;

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startEditing = (site: SiteInfo) => {
    setEditingSiteId(site.id);
    setEditName(site.name);
    setEditAddress(site.address ?? '');
  };

  const cancelEditing = () => {
    setEditingSiteId(null);
  };

  const handleSave = async (siteId: string) => {
    setSaving(true);
    try {
      const updated = await updateSite(siteId, {
        name: editName.trim(),
        address: editAddress.trim() || undefined,
      });
      setSites((prev) => prev.map((s) => (s.id === siteId ? updated : s)));
      setEditingSiteId(null);
    } catch {
      // keep editing
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (site: SiteInfo) => {
    try {
      const updated = await updateSite(site.id, { isActive: !site.isActive });
      setSites((prev) => prev.map((s) => (s.id === site.id ? updated : s)));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100" />;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">拠点管理</h2>

      <div className="space-y-4">
        {sites.map((site) => (
          <div
            key={site.id}
            className={`rounded-lg border p-4 ${site.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-60'}`}
          >
            {editingSiteId === site.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600">拠点名</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">住所</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(site.id)}
                    disabled={saving}
                    className="rounded-lg bg-[#ffc000] px-3 py-2 text-sm font-medium text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{site.name}</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {SITE_TYPE_LABELS[site.siteType] ?? site.siteType}
                    </span>
                    {!site.isActive && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">無効</span>
                    )}
                  </div>
                  {site.address && <p className="mt-1 text-sm text-gray-500">{site.address}</p>}
                </div>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(site)}
                      className="text-sm text-[#b38600] hover:text-[#8a6800]"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleToggleActive(site)}
                      className={`text-sm ${site.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {site.isActive ? '無効化' : '有効化'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {sites.length === 0 && (
          <p className="text-center text-sm text-gray-500">拠点情報がありません</p>
        )}
      </div>
    </section>
  );
}
