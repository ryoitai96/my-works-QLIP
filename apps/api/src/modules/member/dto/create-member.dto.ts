export class CreateMemberDto {
  name!: string;
  email!: string;
  siteId!: string;
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
