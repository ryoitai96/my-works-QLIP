import { apiClient } from '../../lib/api-client';

export interface MicroTask {
  id: string;
  taskCode: string;
  name: string;
  businessCategory: string;
  category: string | null;
  requiredSkillTags: string[];
  difficultyLevel: number;
  standardDuration: number | null;
  physicalLoad: string | null;
  cognitiveLoad: string | null;
  description: string | null;
  isActive: boolean;
}

export async function fetchMicroTasks(): Promise<MicroTask[]> {
  return apiClient<MicroTask[]>('/micro-tasks', { auth: true });
}

export async function completeMicroTask(
  microTaskId: string,
  notes?: string,
) {
  return apiClient(`/micro-tasks/${microTaskId}/completions`, {
    method: 'POST',
    body: { notes },
    auth: true,
  });
}

export async function createMicroTask(data: {
  taskCode: string;
  name: string;
  businessCategory: string;
  category?: string;
  requiredSkillTags?: string[];
  difficultyLevel: number;
  standardDuration?: number;
  physicalLoad?: string;
  cognitiveLoad?: string;
  description?: string;
}): Promise<MicroTask> {
  return apiClient<MicroTask>('/micro-tasks', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function updateMicroTask(
  id: string,
  data: Partial<{
    name: string;
    businessCategory: string;
    category: string;
    requiredSkillTags: string[];
    difficultyLevel: number;
    standardDuration: number;
    physicalLoad: string;
    cognitiveLoad: string;
    description: string;
    isActive: boolean;
  }>,
): Promise<MicroTask> {
  return apiClient<MicroTask>(`/micro-tasks/${id}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export async function deleteMicroTask(id: string): Promise<MicroTask> {
  return apiClient<MicroTask>(`/micro-tasks/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
