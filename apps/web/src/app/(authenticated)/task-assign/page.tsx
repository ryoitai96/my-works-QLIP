import type { Metadata } from 'next';

import { TaskAssignPageContent } from '../../../features/task-assign/components/task-assign-page-content';

export const metadata: Metadata = {
  title: 'タスクアサイン | QLIP',
};

export default function TaskAssignPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <TaskAssignPageContent />
    </div>
  );
}
