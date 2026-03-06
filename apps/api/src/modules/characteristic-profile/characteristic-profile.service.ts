import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface UpsertProfileDto {
  visualCognition?: number | null;
  auditoryCognition?: number | null;
  dexterity?: number | null;
  physicalEndurance?: number | null;
  repetitiveWorkTolerance?: number | null;
  adaptability?: number | null;
  interpersonalCommunication?: number | null;
  concentrationDuration?: number | null;
  stressTolerance?: number | null;
  specialNotes?: string | null;
  clinicSchedule?: string | null;
  medicationTiming?: string | null;
  environmentAccommodation?: string | null;
  communicationAccommodation?: string | null;
}

const SCORE_FIELDS = [
  'visualCognition',
  'auditoryCognition',
  'dexterity',
  'physicalEndurance',
  'repetitiveWorkTolerance',
  'adaptability',
  'interpersonalCommunication',
  'stressTolerance',
] as const;

@Injectable()
export class CharacteristicProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getByMemberId(memberId: string, requestingUser: { userId: string; role: string }) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (requestingUser.role === 'R03' && member.userId !== requestingUser.userId) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return this.prisma.characteristicProfile.findUnique({
      where: { memberId },
    });
  }

  async upsert(memberId: string, dto: UpsertProfileDto, updatedById: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Validate score fields (1-5 range)
    for (const field of SCORE_FIELDS) {
      const value = dto[field];
      if (value != null) {
        if (!Number.isInteger(value) || value < 1 || value > 5) {
          throw new BadRequestException(
            `${field} must be an integer between 1 and 5`,
          );
        }
      }
    }

    // concentrationDuration: positive integer (minutes), no upper limit
    if (dto.concentrationDuration != null) {
      if (
        !Number.isInteger(dto.concentrationDuration) ||
        dto.concentrationDuration < 0
      ) {
        throw new BadRequestException(
          'concentrationDuration must be a non-negative integer (minutes)',
        );
      }
    }

    const existing = await this.prisma.characteristicProfile.findUnique({
      where: { memberId },
    });

    const data = {
      visualCognition: dto.visualCognition,
      auditoryCognition: dto.auditoryCognition,
      dexterity: dto.dexterity,
      physicalEndurance: dto.physicalEndurance,
      repetitiveWorkTolerance: dto.repetitiveWorkTolerance,
      adaptability: dto.adaptability,
      interpersonalCommunication: dto.interpersonalCommunication,
      concentrationDuration: dto.concentrationDuration,
      stressTolerance: dto.stressTolerance,
      specialNotes: dto.specialNotes,
      clinicSchedule: dto.clinicSchedule,
      medicationTiming: dto.medicationTiming,
      environmentAccommodation: dto.environmentAccommodation,
      communicationAccommodation: dto.communicationAccommodation,
      updatedById,
    };

    return this.prisma.characteristicProfile.upsert({
      where: { memberId },
      create: {
        memberId,
        ...data,
        version: 1,
      },
      update: {
        ...data,
        version: (existing?.version ?? 0) + 1,
      },
    });
  }
}
