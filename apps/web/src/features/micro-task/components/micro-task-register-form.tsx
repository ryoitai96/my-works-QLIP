'use client';

import { useState } from 'react';
import { createMicroTask } from '../api';

interface MicroTaskRegisterFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MicroTaskRegisterForm({
  onSuccess,
  onCancel,
}: MicroTaskRegisterFormProps) {
  const [form, setForm] = useState({
    taskCode: '',
    name: '',
    businessCategory: 'flower_lab',
    category: '',
    difficultyLevel: 3,
    standardDuration: '',
    physicalLoad: 'medium',
    cognitiveLoad: 'medium',
    description: '',
    skillTags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.taskCode || !form.name) return;

    setIsSubmitting(true);
    setError('');
    try {
      await createMicroTask({
        taskCode: form.taskCode,
        name: form.name,
        businessCategory: form.businessCategory,
        category: form.category || undefined,
        difficultyLevel: form.difficultyLevel,
        standardDuration: form.standardDuration
          ? parseInt(form.standardDuration)
          : undefined,
        physicalLoad: form.physicalLoad,
        cognitiveLoad: form.cognitiveLoad,
        description: form.description || undefined,
        requiredSkillTags: form.skillTags
          ? form.skillTags.split(',').map((s) => s.trim())
          : undefined,
      });
      onSuccess();
    } catch {
      setError('登録に失敗しました。タスクコードが重複していないか確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CATEGORIES = [
    { value: 'flower_lab', label: 'フラワーラボ' },
    { value: 'satellite_office', label: 'サテライトオフィス' },
    { value: 'custom', label: 'カスタム' },
  ];

  const LOADS = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-base font-bold text-gray-900">
        マイクロタスク登録
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="mt-code" className="mb-1 block text-sm font-medium text-gray-700">
            タスクコード
          </label>
          <input
            id="mt-code"
            name="taskCode"
            value={form.taskCode}
            onChange={handleChange}
            placeholder="例: FL-001"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="mt-name" className="mb-1 block text-sm font-medium text-gray-700">
            タスク名
          </label>
          <input
            id="mt-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="例: バラの茎カット"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="mt-biz" className="mb-1 block text-sm font-medium text-gray-700">
            業務カテゴリ
          </label>
          <select
            id="mt-biz"
            name="businessCategory"
            value={form.businessCategory}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mt-cat" className="mb-1 block text-sm font-medium text-gray-700">
            サブカテゴリ（任意）
          </label>
          <input
            id="mt-cat"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="例: 下処理"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="mt-diff" className="mb-1 block text-sm font-medium text-gray-700">
            難易度 (1-5)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((p) => ({ ...p, difficultyLevel: v }))}
                className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-all ${
                  form.difficultyLevel === v
                    ? 'border-[#ffc000] bg-[#ffc000] text-gray-900'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="mt-dur" className="mb-1 block text-sm font-medium text-gray-700">
            標準所要時間（分、任意）
          </label>
          <input
            id="mt-dur"
            name="standardDuration"
            type="number"
            value={form.standardDuration}
            onChange={handleChange}
            placeholder="例: 30"
            min="1"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label htmlFor="mt-phys" className="mb-1 block text-sm font-medium text-gray-700">
            身体負荷
          </label>
          <select
            id="mt-phys"
            name="physicalLoad"
            value={form.physicalLoad}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {LOADS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mt-cog" className="mb-1 block text-sm font-medium text-gray-700">
            認知負荷
          </label>
          <select
            id="mt-cog"
            name="cognitiveLoad"
            value={form.cognitiveLoad}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {LOADS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="mt-tags" className="mb-1 block text-sm font-medium text-gray-700">
            スキルタグ（カンマ区切り、任意）
          </label>
          <input
            id="mt-tags"
            name="skillTags"
            value={form.skillTags}
            onChange={handleChange}
            placeholder="例: 手先の器用さ, 集中力"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="mt-desc" className="mb-1 block text-sm font-medium text-gray-700">
            説明（任意）
          </label>
          <textarea
            id="mt-desc"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="タスクの詳細説明"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !form.taskCode || !form.name}
          className="rounded-xl bg-[#0077c7] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#005fa3] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? '登録中...' : '登録する'}
        </button>
      </div>
    </form>
  );
}
