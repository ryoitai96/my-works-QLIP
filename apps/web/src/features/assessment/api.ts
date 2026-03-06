import { apiClient } from '../../lib/api-client';

export interface AssessmentAnswer {
  id: string;
  questionId: string;
  domain: string;
  questionText: string;
  score: number | null;
  isStrength: boolean;
}

export interface AssessmentData {
  id: string;
  period: string;
  assessmentDate: string;
  status: string;
  d1Score: number | null;
  d2Score: number | null;
  d3Score: number | null;
  d4Score: number | null;
  d5Score: number | null;
  answers: AssessmentAnswer[];
}

export interface SubmitAssessmentRequest {
  answers: Array<{
    questionId: string;
    domain: string;
    questionText: string;
    score: number;
  }>;
}

export async function fetchLatestAssessment(): Promise<AssessmentData | null> {
  return apiClient<AssessmentData | null>('/assessments/latest', {
    auth: true,
  });
}

export async function submitAssessment(
  data: SubmitAssessmentRequest,
): Promise<AssessmentData> {
  return apiClient<AssessmentData>('/assessments', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function fetchAssessmentHistory(): Promise<AssessmentData[]> {
  return apiClient<AssessmentData[]>('/assessments/history', { auth: true });
}

export async function fetchMemberAssessmentHistory(
  memberId: string,
): Promise<AssessmentData[]> {
  return apiClient<AssessmentData[]>(`/assessments/history/${memberId}`, {
    auth: true,
  });
}

export async function toggleStrengthFlag(
  answerId: string,
): Promise<AssessmentAnswer> {
  return apiClient<AssessmentAnswer>(
    `/assessments/answers/${answerId}/strength`,
    { method: 'PATCH', auth: true },
  );
}
