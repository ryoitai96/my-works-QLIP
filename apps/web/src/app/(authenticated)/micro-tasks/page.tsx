import type { Metadata } from 'next';

import { MicroTaskList } from '../../../features/micro-task/components/micro-task-list';

export const metadata: Metadata = {
  title: 'マイクロタスク一覧 | QLIP',
};

export default function MicroTasksPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          マイクロタスク一覧
        </h1>
        <MicroTaskList />
      </div>
    </div>
  );
}
