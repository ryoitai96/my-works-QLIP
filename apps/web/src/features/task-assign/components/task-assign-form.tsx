'use client';

import { useEffect, useState } from 'react';
import { assignTask } from '../api';
import { fetchMembers, type MemberSummary } from '../../members/api';
import { fetchMicroTasks, type MicroTask } from '../../micro-task/api';

interface TaskAssignFormProps {
  onSuccess: () => void;
}

export function TaskAssignForm({ onSuccess }: TaskAssignFormProps) {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchMicroTasks()])
      .then(([m, t]) => {
        setMembers(m);
        setTasks(t.filter((t) => t.isActive));
      })
      .catch(() => setError('データの取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedTaskId) return;

    setIsSubmitting(true);
    setError('');
    try {
      await assignTask({
        memberId: selectedMemberId,
        microTaskId: selectedTaskId,
        assignedDate,
        notes: notes || undefined,
      });
      setSelectedMemberId('');
      setSelectedTaskId('');
      setNotes('');
      onSuccess();
    } catch {
      setError('アサインに失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-base font-bold text-gray-900">
        タスクアサイン
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Member select */}
        <div>
          <label
            htmlFor="assign-member"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            メンバー
          </label>
          <select
            id="assign-member"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">選択してください</option>
            {members
              .filter((m) => m.status === 'active')
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.name} ({m.site.name})
                </option>
              ))}
          </select>
        </div>

        {/* Task select */}
        <div>
          <label
            htmlFor="assign-task"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            タスク
          </label>
          <select
            id="assign-task"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">選択してください</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.taskCode}] {t.name} (Lv{t.difficultyLevel})
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="assign-date"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            作業日
          </label>
          <input
            id="assign-date"
            type="date"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="assign-notes"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            メモ（任意）
          </label>
          <input
            id="assign-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="補足事項"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !selectedMemberId || !selectedTaskId}
          className="rounded-xl bg-[#0077c7] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#005fa3] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? 'アサイン中...' : 'アサインする'}
        </button>
      </div>
    </form>
  );
}
