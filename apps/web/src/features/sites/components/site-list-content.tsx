'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { isStaffRole } from '../../auth/role-check';
import { type SiteItem, fetchAllSites, createSiteApi, updateSiteApi } from '../api';

const SITE_TYPE_LABELS: Record<string, string> = {
  satellite_office: 'サテライトオフィス',
  flower_lab: 'フラワーラボ',
  remote: 'リモート',
};

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]';

export function SiteListContent() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const user = authStore.getUser();
  const canEdit = user?.role ? isStaffRole(user.role) : false;

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    companyName: '',
    serviceName: '',
    siteType: 'satellite_office',
    address: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    companyName: '',
    serviceName: '',
    address: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAllSites();
      setSites(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('拠点情報の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.companyName ?? '').toLowerCase().includes(q) ||
        (s.serviceName ?? '').toLowerCase().includes(q),
    );
  }, [sites, search]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    setIsCreating(true);
    try {
      await createSiteApi({
        name: createForm.name.trim(),
        companyName: createForm.companyName.trim() || undefined,
        serviceName: createForm.serviceName.trim() || undefined,
        siteType: createForm.siteType,
        address: createForm.address.trim() || undefined,
      });
      setShowCreate(false);
      setCreateForm({ name: '', companyName: '', serviceName: '', siteType: 'satellite_office', address: '' });
      await load();
    } catch {
      // keep form open
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (site: SiteItem) => {
    setEditingId(site.id);
    setEditForm({
      name: site.name,
      companyName: site.companyName ?? '',
      serviceName: site.serviceName ?? '',
      address: site.address ?? '',
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateSiteApi(editingId, {
        name: editForm.name.trim() || undefined,
        companyName: editForm.companyName.trim() || undefined,
        serviceName: editForm.serviceName.trim() || undefined,
        address: editForm.address.trim() || undefined,
      });
      setEditingId(null);
      await load();
    } catch {
      // keep editing
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (site: SiteItem) => {
    try {
      await updateSiteApi(site.id, { isActive: !site.isActive });
      await load();
    } catch {
      // silent
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button onClick={load} className="mt-3 text-sm font-medium text-red-600 hover:text-red-800">再読み込み</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="拠点名・企業名で検索..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="ml-3 shrink-0 rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-[#e6ad00]"
          >
            + 拠点を追加
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-lg border border-[#ffc000]/30 bg-[#ffc000]/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">新しい拠点を追加</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600">拠点名 <span className="text-red-500">*</span></label>
              <input type="text" value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} placeholder="例：東京サテライト" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">施設タイプ <span className="text-red-500">*</span></label>
              <select value={createForm.siteType} onChange={(e) => setCreateForm((p) => ({ ...p, siteType: e.target.value }))} className={inputClass}>
                <option value="satellite_office">サテライトオフィス</option>
                <option value="flower_lab">フラワーラボ</option>
                <option value="remote">リモート</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">企業名</label>
              <input type="text" value={createForm.companyName} onChange={(e) => setCreateForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="例：My WORKS" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">サービス名</label>
              <input type="text" value={createForm.serviceName} onChange={(e) => setCreateForm((p) => ({ ...p, serviceName: e.target.value }))} placeholder="例：フラワーラボ花工房" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600">住所</label>
              <input type="text" value={createForm.address} onChange={(e) => setCreateForm((p) => ({ ...p, address: e.target.value }))} placeholder="例：東京都千代田区..." className={inputClass} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={handleCreate} disabled={isCreating || !createForm.name.trim()} className="rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-medium text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50">
              {isCreating ? '追加中...' : '追加する'}
            </button>
            <button onClick={() => { setShowCreate(false); setCreateForm({ name: '', companyName: '', serviceName: '', siteType: 'satellite_office', address: '' }); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Site list */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              {search ? '検索条件に一致する拠点はありません' : '拠点が登録されていません'}
            </p>
          ) : (
            filtered.map((site) => (
              <div
                key={site.id}
                className={`flex items-start justify-between px-5 py-4 ${!site.isActive ? 'opacity-40' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  {/* Row 1: name + badges */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{site.name}</p>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                      {SITE_TYPE_LABELS[site.siteType] ?? site.siteType}
                    </span>
                    {!site.isActive && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-500">無効</span>
                    )}
                  </div>
                  {/* Row 2: meta */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-gray-400">
                    {site.companyName && <span>{site.companyName}</span>}
                    {site.serviceName && <span>{site.serviceName}</span>}
                    {site.address && <span>{site.address}</span>}
                    <span>{site.memberCount}名配属</span>
                  </div>
                </div>

                {canEdit && (
                  <div className="ml-4 flex shrink-0 items-center gap-3 pt-0.5">
                    <button onClick={() => startEdit(site)} className="text-sm text-[#b38600] hover:text-[#8a6800]">編集</button>
                    <button
                      onClick={() => handleToggleActive(site)}
                      className={`text-sm ${site.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {site.isActive ? '無効化' : '有効化'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Edit modal */}
      {editingId && (
        <div className="modal-overlay flex items-center justify-center">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">拠点を編集</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600">拠点名</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">企業名</label>
                <input type="text" value={editForm.companyName} onChange={(e) => setEditForm((p) => ({ ...p, companyName: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">サービス名</label>
                <input type="text" value={editForm.serviceName} onChange={(e) => setEditForm((p) => ({ ...p, serviceName: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">住所</label>
                <input type="text" value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setEditingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">キャンセル</button>
              <button onClick={handleSave} disabled={isSaving} className="rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50">
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
