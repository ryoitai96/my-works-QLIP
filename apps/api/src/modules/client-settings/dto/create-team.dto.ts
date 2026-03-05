export class CreateTeamDto {
  name!: string;
  departmentCode?: string;
  managerIds?: string[];
  memberIds?: string[];
}
