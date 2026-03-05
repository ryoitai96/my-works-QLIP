import { apiClient, apiUpload, apiDownload } from '../../lib/api-client';

/* ── 型定義 ── */

export interface MemberSummary {
  id: string;
  avatarId: string | null;
  employeeNumber: string | null;
  gender: string | null;
  employmentType: string | null;
  enrolledAt: string;
  status: string;
  user: { name: string; email: string };
  site: { name: string };
}

export interface MemberDetail {
  id: string;
  userId: string;
  tenantId: string;
  siteId: string;
  avatarId: string | null;
  employeeNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  disabilityType: string | null;
  disabilityGrade: string | null;
  handbookType: string | null;
  handbookIssuedAt: string | null;
  handbookExpiresAt: string | null;
  workExperience: string | null;
  preferredWorkAreas: string | null;
  employmentType: string | null;
  enrolledAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
  site: { id: string; name: string };
  documents: DocumentInfo[];
  assessmentResults: {
    id: string;
    period: string;
    assessmentDate: string;
    status: string;
    d1Score: number | null;
    d2Score: number | null;
    d3Score: number | null;
    d4Score: number | null;
    d5Score: number | null;
  }[];
  vitalScores: {
    id: string;
    recordDate: string;
    mood: number;
    sleep: number;
    condition: number;
    bodyTemperature: number | null;
    mealBreakfast: boolean | null;
    mealLunch: boolean | null;
    mealDinner: boolean | null;
    streakDays: number;
  }[];
}

export interface CreateMemberPayload {
  name: string;
  email: string;
  siteId: string;
  employeeNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  disabilityType?: string;
  disabilityGrade?: string;
  handbookType?: string;
  employmentType?: string;
  enrolledAt?: string;
  avatarId?: string;
}

export interface UpdateMemberPayload {
  name?: string;
  email?: string;
  siteId?: string;
  employeeNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  disabilityType?: string;
  disabilityGrade?: string;
  handbookType?: string;
  handbookIssuedAt?: string;
  handbookExpiresAt?: string;
  employmentType?: string;
  enrolledAt?: string;
  status?: string;
  workExperience?: string;
  preferredWorkAreas?: string;
  avatarId?: string;
}

export interface DocumentInfo {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface SiteOption {
  id: string;
  name: string;
}

/* ── API関数 ── */

export function fetchMembers() {
  return apiClient<MemberSummary[]>('/members', { auth: true });
}

export function fetchMemberById(id: string) {
  return apiClient<MemberDetail>(`/members/${id}`, { auth: true });
}

export function createMember(payload: CreateMemberPayload) {
  return apiClient<{ id: string }>('/members', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function updateMember(id: string, payload: UpdateMemberPayload) {
  return apiClient<MemberDetail>(`/members/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export function deleteMember(id: string) {
  return apiClient<{ success: boolean }>(`/members/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function fetchSites() {
  return apiClient<SiteOption[]>('/members/sites', { auth: true });
}

export function uploadDocument(memberId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<DocumentInfo>(`/members/${memberId}/documents`, formData);
}

export function fetchDocuments(memberId: string) {
  return apiClient<DocumentInfo[]>(`/members/${memberId}/documents`, {
    auth: true,
  });
}

export function downloadDocument(memberId: string, docId: string) {
  return apiDownload(`/members/${memberId}/documents/${docId}`);
}

/* ── マイプロフィール（R03メンバー向け） ── */

export function fetchMyProfile() {
  return apiClient<MemberDetail>('/members/me', { auth: true });
}

export function updateMyProfile(payload: { avatarId?: string; name?: string }) {
  return apiClient<MemberDetail>('/members/me', {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}
