'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type SiteOption, type CreateMemberPayload, createMember, fetchSites } from '../api';
import { AvatarPicker } from '../../../components/avatar-picker';

export function MemberCreateContent() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    siteId: '',
    employeeNumber: '',
    gender: '',
    dateOfBirth: '',
    disabilityType: '',
    disabilityGrade: '',
    handbookType: '',
    employmentType: '',
    enrolledAt: '',
    avatarId: 'avatar-01',
  });

  const loadSites = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    try {
      const data = await fetchSites();
      setSites(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const payload: CreateMemberPayload = {
        name: form.name,
        email: form.email,
        siteId: form.siteId,
        ...(form.employeeNumber ? { employeeNumber: form.employeeNumber } : {}),
        ...(form.gender ? { gender: form.gender } : {}),
        ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
        ...(form.disabilityType ? { disabilityType: form.disabilityType } : {}),
        ...(form.disabilityGrade ? { disabilityGrade: form.disabilityGrade } : {}),
        ...(form.handbookType ? { handbookType: form.handbookType } : {}),
        ...(form.employmentType ? { employmentType: form.employmentType } : {}),
        ...(form.enrolledAt ? { enrolledAt: form.enrolledAt } : {}),
        avatarId: form.avatarId,
      };

      await createMember(payload);
      router.push('/members');
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError(
        err instanceof ApiClientError
          ? err.message
          : '登録に失敗しました。',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30';
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

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

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">新規従業員登録</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>アバター</label>
            <AvatarPicker
              value={form.avatarId}
              onChange={(id) => setForm((prev) => ({ ...prev, avatarId: id }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                拠点 <span className="text-red-500">*</span>
              </label>
              <select
                name="siteId"
                required
                value={form.siteId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">選択してください</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>従業員番号</label>
              <input
                type="text"
                name="employeeNumber"
                value={form.employeeNumber}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>性別</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">選択してください</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
                <option value="prefer_not_to_say">回答しない</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>生年月日</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>障害種別</label>
              <select
                name="disabilityType"
                value={form.disabilityType}
                onChange={handleChange}
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
              <label className={labelClass}>障害等級</label>
              <input
                type="text"
                name="disabilityGrade"
                value={form.disabilityGrade}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>雇用形態</label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">選択してください</option>
                <option value="fixed_term">有期雇用</option>
                <option value="permanent">無期雇用</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>入職日</label>
              <input
                type="date"
                name="enrolledAt"
                value={form.enrolledAt}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/members"
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#ffc000] px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-[#e6ad00] disabled:opacity-50"
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
