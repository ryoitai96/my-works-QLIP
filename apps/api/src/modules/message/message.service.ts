import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateMessageDto,
  CreateCommentDto,
  UpdateMessageStatusDto,
} from './dto/create-message.dto';

const STAFF_ROLES = ['R01', 'R02'];
const HR_ROLE = 'R04';
const MEMBER_ROLE = 'R03';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async findRecipients(role: string, tenantId: string) {
    // R03 → R04宛先候補、R04 → R03宛先候補
    const targetRole = role === MEMBER_ROLE ? HR_ROLE : MEMBER_ROLE;
    return this.prisma.user.findMany({
      where: { tenantId, role: targetRole, isActive: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, tenantId: string, dto: CreateMessageDto) {
    const toUser = await this.prisma.user.findUnique({
      where: { id: dto.toUserId },
    });
    if (!toUser) {
      throw new NotFoundException('宛先ユーザーが見つかりません');
    }

    return this.prisma.message.create({
      data: {
        tenantId,
        fromUserId: userId,
        toUserId: dto.toUserId,
        category: dto.category,
        subject: dto.subject,
        content: dto.content,
      },
      include: {
        fromUser: { select: { id: true, name: true, role: true } },
        toUser: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async findAll(userId: string, role: string, tenantId: string) {
    let where: Record<string, unknown>;

    if (STAFF_ROLES.includes(role)) {
      // R01/R02: テナント全件
      where = { tenantId };
    } else if (role === HR_ROLE) {
      // R04: 受信メッセージ
      where = { toUserId: userId };
    } else {
      // R03: 送信メッセージ
      where = { fromUserId: userId };
    }

    return this.prisma.message.findMany({
      where,
      include: {
        fromUser: { select: { id: true, name: true, role: true } },
        toUser: { select: { id: true, name: true, role: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string, tenantId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        fromUser: { select: { id: true, name: true, role: true } },
        toUser: { select: { id: true, name: true, role: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('メッセージが見つかりません');
    }

    // アクセス権チェック
    const isStaff = STAFF_ROLES.includes(role);
    const isOwner =
      message.fromUserId === userId || message.toUserId === userId;
    if (!isStaff && !isOwner) {
      throw new ForbiddenException('このメッセージへのアクセス権がありません');
    }
    if (isStaff && message.tenantId !== tenantId) {
      throw new ForbiddenException('このメッセージへのアクセス権がありません');
    }

    return message;
  }

  async updateStatus(
    id: string,
    userId: string,
    role: string,
    dto: UpdateMessageStatusDto,
  ) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('メッセージが見つかりません');
    }

    // R04（受信者）またはスタッフのみステータス変更可
    const canUpdate =
      (role === HR_ROLE && message.toUserId === userId) ||
      STAFF_ROLES.includes(role);
    if (!canUpdate) {
      throw new ForbiddenException('ステータス変更の権限がありません');
    }

    if (message.status !== 'open') {
      throw new BadRequestException('このメッセージは既に処理済みです');
    }

    return this.prisma.message.update({
      where: { id },
      data: { status: dto.status },
      include: {
        fromUser: { select: { id: true, name: true, role: true } },
        toUser: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async addComment(
    messageId: string,
    userId: string,
    role: string,
    tenantId: string,
    dto: CreateCommentDto,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('メッセージが見つかりません');
    }

    // アクセス権チェック: 送信者、受信者、またはスタッフ
    const isStaff = STAFF_ROLES.includes(role);
    const isOwner =
      message.fromUserId === userId || message.toUserId === userId;
    if (!isStaff && !isOwner) {
      throw new ForbiddenException('コメントの権限がありません');
    }

    return this.prisma.messageComment.create({
      data: {
        messageId,
        userId,
        content: dto.content,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });
  }
}
