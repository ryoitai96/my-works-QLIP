'use client';

import { useState } from 'react';
import { TaskAssignForm } from './task-assign-form';
import { DailyAssignments } from './daily-assignments';

export function TaskAssignPageContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">タスクアサイン</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-[#0077c7] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#005fa3]"
        >
          {showForm ? '閉じる' : '+ 新規アサイン'}
        </button>
      </div>

      {showForm && (
        <TaskAssignForm
          onSuccess={() => {
            setRefreshKey((k) => k + 1);
            setShowForm(false);
          }}
        />
      )}

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          本日のアサイン一覧
        </h2>
        <DailyAssignments refreshKey={refreshKey} />
      </div>
    </div>
  );
}
