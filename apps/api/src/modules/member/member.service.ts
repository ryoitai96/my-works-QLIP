import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Role } from '@qlip/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  /** テナント内メンバー一覧（機微情報を除外） */
  async findByTenant(tenantId: string) {
    return this.prisma.member.findMany({
      where: { tenantId },
      select: {
        id: true,
        avatarId: true,
        employeeNumber: true,
        gender: true,
        employmentType: true,
        enrolledAt: true,
        status: true,
        user: { select: { name: true, email: true } },
        site: { select: { name: true, companyName: true, serviceName: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  /** メンバー詳細取得（documents含む） */
  async findById(id: string, tenantId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { name: true, email: true } },
        site: { select: { id: true, name: true, companyName: true, serviceName: true } },
        documents: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        assessmentResults: {
          take: 1,
          orderBy: { assessmentDate: 'desc' as const },
          where: { status: 'completed' },
          select: {
            id: true,
            period: true,
            assessmentDate: true,
            status: true,
            d1Score: true,
            d2Score: true,
            d3Score: true,
            d4Score: true,
            d5Score: true,
          },
        },
        vitalScores: {
          take: 7,
          orderBy: { recordDate: 'desc' as const },
          select: {
            id: true,
            recordDate: true,
            mood: true,
            sleep: true,
            condition: true,
            bodyTemperature: true,
            mealBreakfast: true,
            mealLunch: true,
            mealDinner: true,
            streakDays: true,
          },
        },
      },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');
    return member;
  }

  /** 次の連番 userCode を生成（例: U-011） */
  private async generateUserCode(): Promise<string> {
    const last = await this.prisma.user.findFirst({
      orderBy: { userCode: 'desc' },
      select: { userCode: true },
    });
    const num = last ? parseInt(last.userCode.replace('U-', ''), 10) + 1 : 1;
    return `U-${String(num).padStart(3, '0')}`;
  }

  /** メンバー新規作成（User + Member を原子的に作成） */
  async create(dto: CreateMemberDto, tenantId: string) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const userCode = await this.generateUserCode();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          userCode,
          email: dto.email,
          name: dto.name,
          passwordHash,
          role: Role.MEMBER,
          tenantId,
          siteId: dto.siteId,
          isActive: true,
        },
      });

      const member = await tx.member.create({
        data: {
          userId: user.id,
          tenantId,
          siteId: dto.siteId,
          avatarId: dto.avatarId || 'avatar-01',
          employeeNumber: dto.employeeNumber || null,
          gender: dto.gender || null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          disabilityType: dto.disabilityType || null,
          disabilityGrade: dto.disabilityGrade || null,
          handbookType: dto.handbookType || null,
          handbookIssuedAt: dto.handbookIssuedAt ? new Date(dto.handbookIssuedAt) : null,
          handbookExpiresAt: dto.handbookExpiresAt ? new Date(dto.handbookExpiresAt) : null,
          employmentType: dto.employmentType || null,
          enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : new Date(),
        },
      });

      return member;
    });
  }

  /** メンバー更新 */
  async update(id: string, dto: UpdateMemberDto, tenantId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id, tenantId },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');

    return this.prisma.$transaction(async (tx) => {
      // User の name / email も更新
      if (dto.name || dto.email) {
        await tx.user.update({
          where: { id: member.userId },
          data: {
            ...(dto.name ? { name: dto.name } : {}),
            ...(dto.email ? { email: dto.email } : {}),
          },
        });
      }

      return tx.member.update({
        where: { id },
        data: {
          ...(dto.siteId ? { siteId: dto.siteId } : {}),
          ...(dto.employeeNumber !== undefined
            ? { employeeNumber: dto.employeeNumber || null }
            : {}),
          ...(dto.gender !== undefined
            ? { gender: dto.gender || null }
            : {}),
          ...(dto.dateOfBirth !== undefined
            ? { dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null }
            : {}),
          ...(dto.disabilityType !== undefined
            ? { disabilityType: dto.disabilityType || null }
            : {}),
          ...(dto.disabilityGrade !== undefined
            ? { disabilityGrade: dto.disabilityGrade || null }
            : {}),
          ...(dto.handbookType !== undefined
            ? { handbookType: dto.handbookType || null }
            : {}),
          ...(dto.handbookIssuedAt !== undefined
            ? { handbookIssuedAt: dto.handbookIssuedAt ? new Date(dto.handbookIssuedAt) : null }
            : {}),
          ...(dto.handbookExpiresAt !== undefined
            ? { handbookExpiresAt: dto.handbookExpiresAt ? new Date(dto.handbookExpiresAt) : null }
            : {}),
          ...(dto.employmentType !== undefined
            ? { employmentType: dto.employmentType || null }
            : {}),
          ...(dto.enrolledAt !== undefined
            ? { enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : undefined }
            : {}),
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.avatarId !== undefined
            ? { avatarId: dto.avatarId || null }
            : {}),
          ...(dto.workExperience !== undefined
            ? { workExperience: dto.workExperience || null }
            : {}),
          ...(dto.preferredWorkAreas !== undefined
            ? { preferredWorkAreas: dto.preferredWorkAreas || null }
            : {}),
        },
        include: {
          user: { select: { name: true, email: true } },
          site: { select: { id: true, name: true, companyName: true, serviceName: true } },
        },
      });
    });
  }

  /** 論理削除（Member.status='inactive' + User.isActive=false） */
  async softDelete(id: string, tenantId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id, tenantId },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');

    await this.prisma.$transaction([
      this.prisma.member.update({
        where: { id },
        data: { status: 'inactive' },
      }),
      this.prisma.user.update({
        where: { id: member.userId },
        data: { isActive: false },
      }),
    ]);

    return { success: true };
  }

  /** 文書アップロード（Document レコード作成） */
  async uploadDocument(
    memberId: string,
    file: { originalname: string; mimetype: string; size: number; path: string },
    uploadedById: string,
    tenantId: string,
  ) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');

    return this.prisma.document.create({
      data: {
        memberId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        uploadedById,
      },
    });
  }

  /** メンバーの文書一覧 */
  async findDocuments(memberId: string, tenantId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');

    return this.prisma.document.findMany({
      where: { memberId },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 文書1件取得（ダウンロード用、filePath含む） */
  async findDocument(memberId: string, docId: string, tenantId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');

    const doc = await this.prisma.document.findFirst({
      where: { id: docId, memberId },
    });
    if (!doc) throw new NotFoundException('文書が見つかりません');

    return doc;
  }

  /** ユーザーIDからメンバープロフィール取得（R03マイプロフィール用） */
  async findByUserId(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        site: { select: { id: true, name: true, companyName: true, serviceName: true } },
      },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');
    return member;
  }

  /** モックOCR（2〜3秒遅延後にダミーデータを返す） */
  async ocrCertificate(_file: { originalname: string; mimetype: string }) {
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 1000),
    );

    return {
      disabilityType: 'physical',
      disabilityGrade: '2級',
      handbookType: 'physical',
      handbookIssuedAt: '2024-04-01',
      handbookExpiresAt: '2029-03-31',
      dateOfBirth: '1990-05-15',
    };
  }

  /** メンバー自身によるプロフィール更新（avatarId, name, 障害情報） */
  async updateSelf(
    userId: string,
    dto: Pick<
      UpdateMemberDto,
      | 'avatarId'
      | 'name'
      | 'disabilityType'
      | 'disabilityGrade'
      | 'handbookType'
      | 'handbookIssuedAt'
      | 'handbookExpiresAt'
      | 'dateOfBirth'
    >,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) throw new NotFoundException('メンバーが見つかりません');

    return this.prisma.$transaction(async (tx) => {
      if (dto.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: dto.name },
        });
      }

      return tx.member.update({
        where: { id: member.id },
        data: {
          ...(dto.avatarId !== undefined ? { avatarId: dto.avatarId || null } : {}),
          ...(dto.disabilityType !== undefined
            ? { disabilityType: dto.disabilityType || null }
            : {}),
          ...(dto.disabilityGrade !== undefined
            ? { disabilityGrade: dto.disabilityGrade || null }
            : {}),
          ...(dto.handbookType !== undefined
            ? { handbookType: dto.handbookType || null }
            : {}),
          ...(dto.handbookIssuedAt !== undefined
            ? { handbookIssuedAt: dto.handbookIssuedAt ? new Date(dto.handbookIssuedAt) : null }
            : {}),
          ...(dto.handbookExpiresAt !== undefined
            ? { handbookExpiresAt: dto.handbookExpiresAt ? new Date(dto.handbookExpiresAt) : null }
            : {}),
          ...(dto.dateOfBirth !== undefined
            ? { dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null }
            : {}),
        },
        include: {
          user: { select: { name: true, email: true } },
          site: { select: { id: true, name: true, companyName: true, serviceName: true } },
        },
      });
    });
  }

  /** テナント内の拠点一覧（フォーム用） */
  async fetchSites(tenantId: string) {
    return this.prisma.site.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, companyName: true },
      orderBy: { name: 'asc' },
    });
  }
}
