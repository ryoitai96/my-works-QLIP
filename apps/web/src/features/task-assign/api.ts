import { apiClient } from '../../lib/api-client';

export interface TaskAssignment {
  id: string;
  status: string;
  assignedDate: string;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  member: {
    id: string;
    avatarId: string | null;
    user: { id: string; name: string };
    site?: { name: string };
  };
  microTask: {
    id: string;
    taskCode: string;
    name: string;
    businessCategory: string;
    difficultyLevel: number;
    standardDuration: number | null;
  };
  assignedBy: { name: string };
}

export interface MyAssignment {
  id: string;
  status: string;
  assignedDate: string;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  microTask: {
    id: string;
    taskCode: string;
    name: string;
    businessCategory: string;
    difficultyLevel: number;
    standardDuration: number | null;
  };
  assignedBy: { name: string };
}

export async function assignTask(data: {
  memberId: string;
  microTaskId: string;
  assignedDate: string;
  notes?: string;
}): Promise<TaskAssignment> {
  return apiClient<TaskAssignment>('/tasks/assign', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function fetchAssignments(
  date?: string,
): Promise<TaskAssignment[]> {
  const query = date ? `?date=${date}` : '';
  return apiClient<TaskAssignment[]>(`/tasks/assignments${query}`, {
    auth: true,
  });
}

export async function fetchMyAssignments(): Promise<MyAssignment[]> {
  return apiClient<MyAssignment[]>('/tasks/my-assignments', { auth: true });
}

export async function updateAssignmentStatus(
  id: string,
  status: string,
): Promise<TaskAssignment> {
  return apiClient<TaskAssignment>(`/tasks/assignments/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}
