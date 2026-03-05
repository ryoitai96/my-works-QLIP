export interface SubmitCorrectionDto {
  attendanceRecordId: string;
  correctionType: 'clock_in' | 'clock_out' | 'break' | 'other';
  requestedValue: string;
  reason: string;
}
