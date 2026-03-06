import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../database/prisma.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class QrThanksService {
  constructor(private readonly prisma: PrismaService) {}

  async createToken(
    user: JwtPayload,
    dto: {
      memberId: string;
      storyText: string;
      flowerOrderId?: string;
      expiresInDays?: number;
    },
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
      include: {
        user: { select: { name: true } },
        site: { select: { name: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('メンバーが見つかりません');
    }

    const token = nanoid(21);
    const expiresInDays = dto.expiresInDays ?? 90;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const qrToken = await this.prisma.giftQrToken.create({
      data: {
        token,
        memberId: dto.memberId,
        memberDisplayName: member.user.name,
        siteName: member.site.name,
        storyText: dto.storyText,
        flowerOrderId: dto.flowerOrderId || null,
        expiresAt,
      },
    });

    return {
      id: qrToken.id,
      token: qrToken.token,
      expiresAt: qrToken.expiresAt,
    };
  }

  async getStory(token: string) {
    const qrToken = await this.prisma.giftQrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      throw new NotFoundException('このQRコードは無効です');
    }

    if (qrToken.expiresAt < new Date()) {
      throw new BadRequestException('このQRコードの有効期限が切れています');
    }

    return {
      memberDisplayName: qrToken.memberDisplayName,
      siteName: qrToken.siteName,
      storyText: qrToken.storyText,
      isUsed: qrToken.isUsed,
    };
  }

  async submitThanks(
    token: string,
    dto?: { senderDisplayName?: string; message?: string },
  ) {
    const qrToken = await this.prisma.giftQrToken.findUnique({
      where: { token },
      include: { member: { select: { userId: true } } },
    });

    if (!qrToken) {
      throw new NotFoundException('このQRコードは無効です');
    }

    if (qrToken.expiresAt < new Date()) {
      throw new BadRequestException('このQRコードの有効期限が切れています');
    }

    const thanksCard = await this.prisma.thanksCard.create({
      data: {
        fromUserId: null,
        toUserId: qrToken.member.userId,
        content: dto?.message || 'ありがとうございます！',
        category: 'kindness',
        isQrThanks: true,
        senderDisplayName: dto?.senderDisplayName || null,
        qrTokenId: qrToken.id,
      },
    });

    await this.prisma.giftQrToken.update({
      where: { id: qrToken.id },
      data: { isUsed: true },
    });

    return { id: thanksCard.id, message: '感謝が届きました！' };
  }

  async listTokens(user: JwtPayload) {
    const where: Record<string, unknown> = {};

    if (user.tenantId) {
      where.member = { tenantId: user.tenantId };
    }

    return this.prisma.giftQrToken.findMany({
      where,
      include: {
        _count: { select: { thanksCards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
