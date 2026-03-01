import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('ThanksController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let senderToken: string;
  let receiverToken: string;
  let senderId: string;
  let receiverId: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // テスト用テナント作成
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant' },
    });
    tenantId = tenant.id;

    // テスト用ユーザー作成
    const sender = await prisma.user.create({
      data: {
        email: `thanks-sender-${Date.now()}@test.com`,
        passwordHash: 'dummy',
        name: 'Sender User',
        role: 'R03',
        tenantId,
      },
    });
    senderId = sender.id;

    const receiver = await prisma.user.create({
      data: {
        email: `thanks-receiver-${Date.now()}@test.com`,
        passwordHash: 'dummy',
        name: 'Receiver User',
        role: 'R03',
        tenantId,
      },
    });
    receiverId = receiver.id;

    // JWT生成
    senderToken = jwtService.sign({
      sub: senderId,
      email: sender.email,
      role: sender.role,
      tenantId,
    });
    receiverToken = jwtService.sign({
      sub: receiverId,
      email: receiver.email,
      role: receiver.role,
      tenantId,
    });
  });

  afterAll(async () => {
    // テストデータクリーンアップ
    await prisma.thanksCard.deleteMany({
      where: {
        OR: [{ fromUserId: senderId }, { toUserId: receiverId }],
      },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [senderId, receiverId] } },
    });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  describe('POST /api/thanks', () => {
    it('認証なしのリクエストは401を返す', () => {
      return request(app.getHttpServer())
        .post('/api/thanks')
        .send({
          toUserId: receiverId,
          content: 'ありがとう！',
          category: 'great_job',
        })
        .expect(401);
    });

    it('正常にサンクスカードを送信できる', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/thanks')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          toUserId: receiverId,
          content: 'いつも助けてくれてありがとう！',
          category: 'teamwork',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        fromUserId: senderId,
        toUserId: receiverId,
        content: 'いつも助けてくれてありがとう！',
        category: 'teamwork',
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('自分自身へのサンクスカード送信は400を返す', () => {
      return request(app.getHttpServer())
        .post('/api/thanks')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          toUserId: senderId,
          content: '自分に感謝',
          category: 'other',
        })
        .expect(400);
    });
  });

  describe('GET /api/thanks', () => {
    it('認証なしのリクエストは401を返す', () => {
      return request(app.getHttpServer())
        .get('/api/thanks')
        .expect(401);
    });

    it('自分宛てのサンクスカード一覧を取得できる', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/thanks')
        .set('Authorization', `Bearer ${receiverToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      for (const card of res.body) {
        expect(card.toUserId).toBe(receiverId);
        expect(card.fromUser).toBeDefined();
        expect(card.fromUser.name).toBeDefined();
      }
    });

    it('送信者として取得した場合は自分宛のカードのみ返る', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/thanks')
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      for (const card of res.body) {
        expect(card.toUserId).toBe(senderId);
      }
    });
  });
});
