import { apiClient } from '../../lib/api-client';

// ========== 型定義 ==========

export interface AttendanceBreak {
  id: string;
  breakStart: string;
  breakEnd: string | null;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  recordDate: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'not_clocked_in' | 'clocked_in' | 'on_break' | 'clocked_out';
  workMinutes: number | null;
  breakMinutes: number | null;
  breaks: AttendanceBreak[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  year: number;
  month: number;
  workedDays: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  correctionCount: number;
  schedule: WorkSchedule | null;
}

export interface WorkSchedule {
  id?: string;
  memberId: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workDaysPerWeek: number;
}

export interface CorrectionRequest {
  id: string;
  attendanceRecordId: string;
  correctionType: 'clock_in' | 'clock_out' | 'break' | 'other';
  requestedValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  reviewComment: string | null;
  reviewedAt: string | null;
  createdAt: string;
  attendanceRecord?: AttendanceRecord;
  requestedBy?: { name: string };
  reviewedBy?: { name: string } | null;
}

export interface MemberTodayAttendance {
  memberId: string;
  memberName: string;
  avatarId: string | null;
  attendance: AttendanceRecord | null;
}

export interface PendingCorrection extends CorrectionRequest {
  attendanceRecord: AttendanceRecord & {
    member: { user: { name: string }; id: string };
  };
  requestedBy: { name: string };
}

// ========== 打刻 API ==========

export async function clockIn(): Promise<AttendanceRecord> {
  return apiClient<AttendanceRecord>('/attendance/clock-in', {
    method: 'POST',
    auth: true,
  });
}

export async function clockOut(): Promise<AttendanceRecord> {
  return apiClient<AttendanceRecord>('/attendance/clock-out', {
    method: 'POST',
    auth: true,
  });
}

export async function breakStart(): Promise<AttendanceRecord> {
  return apiClient<AttendanceRecord>('/attendance/break-start', {
    method: 'POST',
    auth: true,
  });
}

export async function breakEnd(): Promise<AttendanceRecord> {
  return apiClient<AttendanceRecord>('/attendance/break-end', {
    method: 'POST',
    auth: true,
  });
}

// ========== メンバー閲覧 API ==========

export async function fetchTodayAttendance(): Promise<AttendanceRecord | null> {
  return apiClient<AttendanceRecord | null>('/attendance/today', { auth: true });
}

export async function fetchMonthlyAttendance(
  year: number,
  month: number,
): Promise<AttendanceRecord[]> {
  return apiClient<AttendanceRecord[]>(
    `/attendance/monthly?year=${year}&month=${month}`,
    { auth: true },
  );
}

export async function fetchMonthlySummary(
  year: number,
  month: number,
): Promise<AttendanceSummary> {
  return apiClient<AttendanceSummary>(
    `/attendance/summary?year=${year}&month=${month}`,
    { auth: true },
  );
}

// ========== 修正申請 API ==========

export async function submitCorrection(data: {
  attendanceRecordId: string;
  correctionType: string;
  requestedValue: string;
  reason: string;
}): Promise<CorrectionRequest> {
  return apiClient<CorrectionRequest>('/attendance/corrections', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function fetchMyCorrections(): Promise<CorrectionRequest[]> {
  return apiClient<CorrectionRequest[]>('/attendance/corrections/mine', {
    auth: true,
  });
}

// ========== スタッフ閲覧 API ==========

export async function fetchMembersTodayAttendance(): Promise<
  MemberTodayAttendance[]
> {
  return apiClient<MemberTodayAttendance[]>('/attendance/members/today', {
    auth: true,
  });
}

export async function fetchMemberMonthly(
  memberId: string,
  year: number,
  month: number,
): Promise<AttendanceRecord[]> {
  return apiClient<AttendanceRecord[]>(
    `/attendance/members/${memberId}/monthly?year=${year}&month=${month}`,
    { auth: true },
  );
}

// ========== 人事承認 API ==========

export async function fetchPendingCorrections(): Promise<PendingCorrection[]> {
  return apiClient<PendingCorrection[]>('/attendance/corrections/pending', {
    auth: true,
  });
}

export async function reviewCorrection(
  id: string,
  data: { status: 'approved' | 'rejected' | 'returned'; reviewComment?: string },
): Promise<CorrectionRequest> {
  return apiClient<CorrectionRequest>(`/attendance/corrections/${id}/review`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

// ========== スケジュール API ==========

export async function fetchWorkSchedule(
  memberId: string,
): Promise<WorkSchedule> {
  return apiClient<WorkSchedule>(`/attendance/schedule/${memberId}`, {
    auth: true,
  });
}

export async function updateWorkSchedule(
  memberId: string,
  data: Partial<Omit<WorkSchedule, 'id' | 'memberId'>>,
): Promise<WorkSchedule> {
  return apiClient<WorkSchedule>(`/attendance/schedule/${memberId}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}
