import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ThanksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    fromUserId: string,
    dto: { toUserId: string; content: string; category: string },
  ) {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('自分自身にサンクスカードを送ることはできません');
    }

    return this.prisma.thanksCard.create({
      data: {
        fromUserId,
        toUserId: dto.toUserId,
        content: dto.content,
        category: dto.category,
      },
    });
  }

  async findReceivedByUserId(userId: string) {
    return this.prisma.thanksCard.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
