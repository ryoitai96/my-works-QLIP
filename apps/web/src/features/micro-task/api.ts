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
