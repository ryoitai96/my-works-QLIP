export interface CreateMessageDto {
  toUserId: string;
  category:
    | 'late_notice'
    | 'early_leave'
    | 'paid_leave'
    | 'welfare'
    | 'meeting'
    | 'other';
  subject: string;
  content: string;
}

export interface CreateCommentDto {
  content: string;
}

export interface UpdateMessageStatusDto {
  status: 'resolved' | 'closed';
}
