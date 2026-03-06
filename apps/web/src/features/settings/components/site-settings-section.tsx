'use client';

import { useEffect, useState } from 'react';
import { fetchSites, updateSite, createSite, type SiteInfo } from '../api';
import { isStaffRole } from '../../auth/role-check';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSiteType, setNewSiteType] = useState('satellite_office');
  const [newAddress, setNewAddress] = useState('');
  const [creating, setCreating] = useState(false);

  const user = authStore.getUser();
  const canEdit = user?.role ? isStaffRole(user.role) : false;

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

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await createSite({
        name: newName.trim(),
        siteType: newSiteType,
        address: newAddress.trim() || undefined,
      });
      setSites((prev) => [...prev, created]);
      setShowAddForm(false);
      setNewName('');
      setNewSiteType('satellite_office');
      setNewAddress('');
    } catch {
      // keep form open
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100" />;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">拠点管理</h2>
        {canEdit && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-[#ffc000] px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-[#e6ad00]"
          >
            + 拠点を追加
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-4 rounded-lg border border-[#ffc000]/30 bg-[#ffc000]/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">新しい拠点を追加</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">拠点名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例：東京サテライトオフィス"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">施設タイプ <span className="text-red-500">*</span></label>
              <select
                value={newSiteType}
                onChange={(e) => setNewSiteType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
              >
                <option value="satellite_office">サテライトオフィス</option>
                <option value="flower_lab">フラワーラボ</option>
                <option value="remote">リモート</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">住所</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="例：東京都千代田区..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-medium text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
              >
                {creating ? '追加中...' : '追加する'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewSiteType('satellite_office');
                  setNewAddress('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

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
