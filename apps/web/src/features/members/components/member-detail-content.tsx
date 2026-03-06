'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import {
  type MemberDetail,
  type SiteOption,
  type DocumentInfo,
  fetchMemberById,
  updateMember,
  deleteMember,
  fetchSites,
  uploadDocument,
  downloadDocument,
} from '../api';
import { PentagonChart } from '../../assessment/components/pentagon-chart';
import { CharacteristicProfileCard } from '../../characteristic-profile/components/characteristic-profile-card';
import { MemberAvatar } from '../../../components/member-avatar';
import { AvatarPicker } from '../../../components/avatar-picker';

const STATUS_LABELS: Record<string, string> = {
  active: '在籍',
  on_leave: '休職中',
  inactive: '退職',
};

const GENDER_LABELS: Record<string, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
  prefer_not_to_say: '回答しない',
};

const DISABILITY_TYPE_LABELS: Record<string, string> = {
  physical: '身体障害',
  intellectual: '知的障害',
  mental: '精神障害',
  developmental: '発達障害',
  multiple: '重複障害',
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  fixed_term: '有期雇用',
  permanent: '無期雇用',
};

const HANDBOOK_TYPE_LABELS: Record<string, string> = {
  physical: '身体障害者手帳',
  rehabilitation: '療育手帳',
  mental_health: '精神障害者保健福祉手帳',
};

function formatDate(v: string | null): string {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('ja-JP');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DlItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export function MemberDetailContent({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Documents
  const [isUploading, setIsUploading] = useState(false);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const [data, sitesData] = await Promise.all([
        fetchMemberById(memberId),
        fetchSites(),
      ]);
      setMember(data);
      setSites(sitesData);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('従業員情報の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [memberId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = () => {
    if (!member) return;
    setEditForm({
      name: member.user.name,
      email: member.user.email,
      siteId: member.siteId,
      avatarId: member.avatarId ?? 'avatar-01',
      employeeNumber: member.employeeNumber ?? '',
      gender: member.gender ?? '',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : '',
      disabilityType: member.disabilityType ?? '',
      disabilityGrade: member.disabilityGrade ?? '',
      handbookType: member.handbookType ?? '',
      handbookIssuedAt: member.handbookIssuedAt ? member.handbookIssuedAt.slice(0, 10) : '',
      handbookExpiresAt: member.handbookExpiresAt ? member.handbookExpiresAt.slice(0, 10) : '',
      employmentType: member.employmentType ?? '',
      enrolledAt: member.enrolledAt ? member.enrolledAt.slice(0, 10) : '',
      status: member.status,
    });
    setIsEditing(true);
    setSaveError('');
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await updateMember(memberId, editForm);
      setIsEditing(false);
      await load();
    } catch (err) {
      setSaveError(
        err instanceof ApiClientError ? err.message : '保存に失敗しました。',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadDocument(memberId, file);
      await load();
    } catch {
      // silent
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (doc: DocumentInfo) => {
    try {
      const blob = await downloadDocument(memberId, doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMember(memberId);
      router.push('/members');
    } catch {
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error || '従業員が見つかりません'}</p>
        <Link href="/members" className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-800">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const inputClass =
    'block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30';

  return (
    <div>
      <Link
        href="/members"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        従業員一覧に戻る
      </Link>

      <div className="space-y-6">
        {/* 基本情報カード */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MemberAvatar avatarId={member.avatarId} size="lg" />
              <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={startEdit}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                編集
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-[#ffc000] px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>

          {saveError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {saveError}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500">アバター</label>
                <AvatarPicker
                  value={editForm.avatarId ?? 'avatar-01'}
                  onChange={(id) => setEditForm((prev) => ({ ...prev, avatarId: id }))}
                />
              </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">氏名</label>
                <input type="text" name="name" value={editForm.name ?? ''} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">メール</label>
                <input type="email" name="email" value={editForm.email ?? ''} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">従業員番号</label>
                <input type="text" name="employeeNumber" value={editForm.employeeNumber ?? ''} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">性別</label>
                <select name="gender" value={editForm.gender ?? ''} onChange={handleEditChange} className={inputClass}>
                  <option value="">未設定</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                  <option value="prefer_not_to_say">回答しない</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">拠点</label>
                <select name="siteId" value={editForm.siteId ?? ''} onChange={handleEditChange} className={inputClass}>
                  <option value="">選択してください</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.companyName ? `${s.companyName} / ${s.name}` : s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">雇用形態</label>
                <select name="employmentType" value={editForm.employmentType ?? ''} onChange={handleEditChange} className={inputClass}>
                  <option value="">未設定</option>
                  <option value="fixed_term">有期雇用</option>
                  <option value="permanent">無期雇用</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">ステータス</label>
                <select name="status" value={editForm.status ?? ''} onChange={handleEditChange} className={inputClass}>
                  <option value="active">在籍</option>
                  <option value="on_leave">休職中</option>
                  <option value="inactive">退職</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">入職日</label>
                <input type="date" name="enrolledAt" value={editForm.enrolledAt ?? ''} onChange={handleEditChange} className={inputClass} />
              </div>
            </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DlItem label="氏名" value={member.user.name} />
              <DlItem label="メール" value={member.user.email} />
              <DlItem label="従業員番号" value={member.employeeNumber ?? '—'} />
              <DlItem
                label="性別"
                value={member.gender ? (GENDER_LABELS[member.gender] ?? member.gender) : '—'}
              />
              <DlItem
                label="拠点"
                value={[member.site.companyName, member.site.name].filter(Boolean).join(' / ')}
              />
              {member.site.serviceName && (
                <DlItem label="サービス名" value={member.site.serviceName} />
              )}
              <DlItem
                label="雇用形態"
                value={member.employmentType ? (EMPLOYMENT_TYPE_LABELS[member.employmentType] ?? member.employmentType) : '—'}
              />
              <DlItem
                label="ステータス"
                value={STATUS_LABELS[member.status] ?? member.status}
              />
              <DlItem label="入職日" value={formatDate(member.enrolledAt)} />
            </dl>
          )}
        </div>

        {/* 障害情報カード */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">障害情報</h2>

          {isEditing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">障害種別</label>
                <select name="disabilityType" value={editForm.disabilityType ?? ''} onChange={handleEditChange} className={inputClass}>
                  <option value="">未設定</option>
                  <option value="physical">身体障害</option>
                  <option value="intellectual">知的障害</option>
                  <option value="mental">精神障害</option>
                  <option value="developmental">発達障害</option>
                  <option value="multiple">重複障害</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">障害等級</label>
                <input type="text" name="disabilityGrade" value={editForm.disabilityGrade ?? ''} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">手帳種類</label>
                <select name="handbookType" value={editForm.handbookType ?? ''} onChange={handleEditChange} className={inputClass}>
                  <option value="">未設定</option>
                  <option value="physical">身体障害者手帳</option>
                  <option value="rehabilitation">療育手帳</option>
                  <option value="mental_health">精神障害者保健福祉手帳</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">手帳取得日</label>
                <input type="date" name="handbookIssuedAt" value={editForm.handbookIssuedAt ?? ''} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">有効期限</label>
                <input type="date" name="handbookExpiresAt" value={editForm.handbookExpiresAt ?? ''} onChange={handleEditChange} className={inputClass} />
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DlItem
                label="障害種別"
                value={member.disabilityType ? (DISABILITY_TYPE_LABELS[member.disabilityType] ?? member.disabilityType) : '—'}
              />
              <DlItem label="障害等級" value={member.disabilityGrade ?? '—'} />
              <DlItem
                label="手帳種類"
                value={member.handbookType ? (HANDBOOK_TYPE_LABELS[member.handbookType] ?? member.handbookType) : '—'}
              />
              <DlItem label="手帳取得日" value={formatDate(member.handbookIssuedAt)} />
              <DlItem label="有効期限" value={formatDate(member.handbookExpiresAt)} />
            </dl>
          )}
        </div>

        {/* アセスメント結果カード */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">アセスメント結果</h2>
          {member.assessmentResults.length > 0 ? (() => {
            const ar = member.assessmentResults[0];
            const domains = [
              { label: 'D1: 職務遂行', score: ar.d1Score },
              { label: 'D2: 労働習慣', score: ar.d2Score },
              { label: 'D3: 対人関係', score: ar.d3Score },
              { label: 'D4: 感情制御', score: ar.d4Score },
              { label: 'D5: 自己管理', score: ar.d5Score },
            ];
            return (
              <div>
                <p className="mb-4 text-sm text-gray-500">
                  対象期間: {ar.period} / 実施日: {formatDate(ar.assessmentDate)}
                </p>
                <PentagonChart
                  scores={{
                    d1: ar.d1Score,
                    d2: ar.d2Score,
                    d3: ar.d3Score,
                    d4: ar.d4Score,
                    d5: ar.d5Score,
                  }}
                />
                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {domains.map((d) => (
                    <div key={d.label}>
                      <dt className="text-xs font-medium text-gray-500">{d.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                        {d.score != null ? d.score.toFixed(1) : '—'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })() : (
            <p className="py-4 text-center text-sm text-gray-400">
              アセスメント結果はまだありません
            </p>
          )}
        </div>

        {/* 特性プロファイルカード */}
        <CharacteristicProfileCard memberId={memberId} />

        {/* 体調入力カード */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">体調入力</h2>
          {member.vitalScores && member.vitalScores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2">日付</th>
                    <th className="px-4 py-2">気分</th>
                    <th className="px-4 py-2">睡眠</th>
                    <th className="px-4 py-2">体調</th>
                    <th className="px-4 py-2">体温</th>
                    <th className="px-4 py-2">食事</th>
                    <th className="px-4 py-2">連続日数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {member.vitalScores.map((vs) => (
                    <tr key={vs.id}>
                      <td className="px-4 py-2.5 text-gray-900">{formatDate(vs.recordDate)}</td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {['', 'とてもつらい', 'つらい', 'ふつう', 'よい', 'とてもよい'][vs.mood] ?? `${vs.mood}`}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {['', '眠れなかった', 'あまり眠れず', 'ふつう', 'よく眠れた', 'ぐっすり'][vs.sleep] ?? `${vs.sleep}`}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {['', 'つらい', 'やや不調', 'ふつう', 'まあまあ', '元気'][vs.condition] ?? `${vs.condition}`}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {vs.bodyTemperature != null ? `${vs.bodyTemperature}℃` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {vs.mealBreakfast != null || vs.mealLunch != null || vs.mealDinner != null
                          ? [
                              vs.mealBreakfast && '朝',
                              vs.mealLunch && '昼',
                              vs.mealDinner && '夕',
                            ]
                              .filter(Boolean)
                              .join('・') || '—'
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{vs.streakDays}日</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">
              体調入力の記録はまだありません
            </p>
          )}
        </div>

        {/* 書類カード */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">書類</h2>

          <div className="mb-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {isUploading ? 'アップロード中...' : 'ファイルを選択'}
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {member.documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2">ファイル名</th>
                    <th className="px-4 py-2">タイプ</th>
                    <th className="px-4 py-2">サイズ</th>
                    <th className="px-4 py-2">登録日</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {member.documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{doc.fileName}</td>
                      <td className="px-4 py-2.5 text-gray-600">{doc.fileType}</td>
                      <td className="px-4 py-2.5 text-gray-600">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-4 py-2.5 text-gray-500">{formatDate(doc.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-sm font-medium text-[#b38600] hover:text-[#8a6800]"
                        >
                          DL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">
              書類はまだ登録されていません
            </p>
          )}
        </div>

        {/* 無効化ボタン */}
        {member.status !== 'inactive' && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-300 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              無効化
            </button>
          </div>
        )}
      </div>

      {/* 確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="modal-overlay flex items-center justify-center">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">従業員を無効化</h3>
            <p className="mb-5 text-sm text-gray-600">
              {member.user.name} さんを無効化します。この操作は後で元に戻すことができます。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? '処理中...' : '無効化する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
