'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type MemberDetail, type OcrResult, fetchMyProfile, updateMyProfile } from '../api';
import { MemberAvatar } from '../../../components/member-avatar';
import { AvatarPicker } from '../../../components/avatar-picker';
import { CertificateOcrUploader } from './certificate-ocr-uploader';
import { CharacteristicProfileCard } from '../../characteristic-profile/components/characteristic-profile-card';

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

function DlItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export function MyProfileContent() {
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarId, setEditAvatarId] = useState('avatar-01');
  const [editDisabilityType, setEditDisabilityType] = useState('');
  const [editDisabilityGrade, setEditDisabilityGrade] = useState('');
  const [editHandbookType, setEditHandbookType] = useState('');
  const [editHandbookIssuedAt, setEditHandbookIssuedAt] = useState('');
  const [editHandbookExpiresAt, setEditHandbookExpiresAt] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [ocrFilledFields, setOcrFilledFields] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchMyProfile();
      setMember(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('プロフィールの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDateForInput = (v: string | null): string => {
    if (!v) return '';
    return new Date(v).toISOString().split('T')[0];
  };

  const startEdit = () => {
    if (!member) return;
    setEditName(member.user.name);
    setEditAvatarId(member.avatarId ?? 'avatar-01');
    setEditDisabilityType(member.disabilityType ?? '');
    setEditDisabilityGrade(member.disabilityGrade ?? '');
    setEditHandbookType(member.handbookType ?? '');
    setEditHandbookIssuedAt(formatDateForInput(member.handbookIssuedAt));
    setEditHandbookExpiresAt(formatDateForInput(member.handbookExpiresAt));
    setEditDateOfBirth(formatDateForInput(member.dateOfBirth));
    setOcrFilledFields(new Set());
    setIsEditing(true);
    setSaveError('');
  };

  const handleOcrResult = (result: OcrResult) => {
    const filled = new Set<string>();
    const setters: Record<string, (v: string) => void> = {
      disabilityType: setEditDisabilityType,
      disabilityGrade: setEditDisabilityGrade,
      handbookType: setEditHandbookType,
      handbookIssuedAt: setEditHandbookIssuedAt,
      handbookExpiresAt: setEditHandbookExpiresAt,
      dateOfBirth: setEditDateOfBirth,
    };
    const currentValues: Record<string, string> = {
      disabilityType: editDisabilityType,
      disabilityGrade: editDisabilityGrade,
      handbookType: editHandbookType,
      handbookIssuedAt: editHandbookIssuedAt,
      handbookExpiresAt: editHandbookExpiresAt,
      dateOfBirth: editDateOfBirth,
    };

    for (const [key, value] of Object.entries(result)) {
      if (value && !currentValues[key] && setters[key]) {
        setters[key](value);
        filled.add(key);
      }
    }
    setOcrFilledFields((prev) => new Set([...prev, ...filled]));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await updateMyProfile({
        avatarId: editAvatarId,
        name: editName,
        disabilityType: editDisabilityType || undefined,
        disabilityGrade: editDisabilityGrade || undefined,
        handbookType: editHandbookType || undefined,
        handbookIssuedAt: editHandbookIssuedAt || undefined,
        handbookExpiresAt: editHandbookExpiresAt || undefined,
        dateOfBirth: editDateOfBirth || undefined,
      });
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error || 'プロフィールが見つかりません'}</p>
      </div>
    );
  }

  const inputClass =
    'block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30';

  return (
    <div className="space-y-6">
      {/* 基本情報カード */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MemberAvatar avatarId={member.avatarId} size="lg" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{member.user.name}</h2>
              <p className="text-sm text-gray-500">{member.user.email}</p>
            </div>
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
                value={editAvatarId}
                onChange={(id) => setEditAvatarId(id)}
              />
            </div>
            <div className="max-w-sm">
              <label className="mb-1 block text-xs font-medium text-gray-500">氏名</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="max-w-sm">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                生年月日
                {ocrFilledFields.has('dateOfBirth') && <span className="ml-2 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">手帳から自動入力</span>}
              </label>
              <input
                type="date"
                value={editDateOfBirth}
                onChange={(e) => setEditDateOfBirth(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DlItem label="氏名" value={member.user.name} />
            <DlItem label="メール" value={member.user.email} />
            <DlItem label="拠点" value={member.site?.name ?? '—'} />
            <DlItem label="従業員番号" value={member.employeeNumber ?? '—'} />
            <DlItem
              label="性別"
              value={member.gender ? (GENDER_LABELS[member.gender] ?? member.gender) : '—'}
            />
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
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">障害者手帳OCR読み取り</label>
              <CertificateOcrUploader onOcrResult={handleOcrResult} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  障害種別
                  {ocrFilledFields.has('disabilityType') && <span className="ml-2 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">手帳から自動入力</span>}
                </label>
                <select
                  value={editDisabilityType}
                  onChange={(e) => setEditDisabilityType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">選択してください</option>
                  <option value="physical">身体障害</option>
                  <option value="intellectual">知的障害</option>
                  <option value="mental">精神障害</option>
                  <option value="developmental">発達障害</option>
                  <option value="multiple">重複障害</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  障害等級
                  {ocrFilledFields.has('disabilityGrade') && <span className="ml-2 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">手帳から自動入力</span>}
                </label>
                <input
                  type="text"
                  value={editDisabilityGrade}
                  onChange={(e) => setEditDisabilityGrade(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  手帳種類
                  {ocrFilledFields.has('handbookType') && <span className="ml-2 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">手帳から自動入力</span>}
                </label>
                <select
                  value={editHandbookType}
                  onChange={(e) => setEditHandbookType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">選択してください</option>
                  <option value="physical">身体障害者手帳</option>
                  <option value="rehabilitation">療育手帳</option>
                  <option value="mental_health">精神障害者保健福祉手帳</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  手帳取得日
                  {ocrFilledFields.has('handbookIssuedAt') && <span className="ml-2 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">手帳から自動入力</span>}
                </label>
                <input
                  type="date"
                  value={editHandbookIssuedAt}
                  onChange={(e) => setEditHandbookIssuedAt(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  有効期限
                  {ocrFilledFields.has('handbookExpiresAt') && <span className="ml-2 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">手帳から自動入力</span>}
                </label>
                <input
                  type="date"
                  value={editHandbookExpiresAt}
                  onChange={(e) => setEditHandbookExpiresAt(e.target.value)}
                  className={inputClass}
                />
              </div>
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

      {/* 特性プロファイルカード（閲覧のみ） */}
      <CharacteristicProfileCard memberId={member.id} readonly />
    </div>
  );
}
