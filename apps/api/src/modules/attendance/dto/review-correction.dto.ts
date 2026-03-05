export interface ReviewCorrectionDto {
  status: 'approved' | 'rejected' | 'returned';
  reviewComment?: string;
}
