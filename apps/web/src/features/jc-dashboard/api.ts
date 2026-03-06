import { apiClient } from '../../lib/api-client';

export interface MemberVitalScore {
  mood: number;
  sleep: number;
  condition: number;
  average: number | null;
  streakDays: number;
}

export interface TeamMemberOverview {
  memberId: string;
  userId: string;
  name: string;
  avatarId: string | null;
  siteName: string;
  status: 'good' | 'caution' | 'warning' | 'not_submitted';
  alertLevel: string | null;
  alertReason: string | null;
  vitalScore: MemberVitalScore | null;
}

export interface AlertMember extends TeamMemberOverview {
  alertReasons: string[];
  recommendedActions: string[];
}

export async function fetchTeamOverview(): Promise<TeamMemberOverview[]> {
  return apiClient<TeamMemberOverview[]>('/health-checks/team-overview', {
    auth: true,
  });
}

export async function fetchAlerts(): Promise<AlertMember[]> {
  return apiClient<AlertMember[]>('/health-checks/alerts', { auth: true });
}

export async function setManualAlert(
  memberId: string,
  alertLevel: string | null,
  alertReason: string | null,
): Promise<{ id: string; alertLevel: string | null; alertReason: string | null }> {
  return apiClient('/health-checks/alerts/manual', {
    method: 'POST',
    body: { memberId, alertLevel, alertReason },
    auth: true,
  });
}

// Production progress
export interface ProductionProgress {
  total: number;
  pending: number;
  confirmed: number;
  inProduction: number;
  delivered: number;
}

export async function fetchProductionProgress(): Promise<ProductionProgress> {
  return apiClient<ProductionProgress>('/dashboard/production-progress', {
    auth: true,
  });
}

// Assessment team overview
export interface AssessmentTeamMember {
  memberId: string;
  userId: string;
  name: string;
  avatarId: string | null;
  siteName: string;
  latestAssessment: {
    id: string;
    period: string;
    assessmentDate: string;
    d1Score: number | null;
    d2Score: number | null;
    d3Score: number | null;
    d4Score: number | null;
    d5Score: number | null;
  } | null;
}

export async function fetchAssessmentTeamOverview(): Promise<
  AssessmentTeamMember[]
> {
  return apiClient<AssessmentTeamMember[]>('/assessments/team-overview', {
    auth: true,
  });
}
