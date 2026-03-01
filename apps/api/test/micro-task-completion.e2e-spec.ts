import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('MicroTask Completion (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let memberToken: string;
  let nonMemberToken: string;
  let memberId: string;
  let memberUserId: string;
  let nonMemberUserId: string;
  let tenantId: string;
  let siteId: string;
  let microTaskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // テナント作成
    const tenant = await prisma.tenant.create({
      data: { name: 'Completion Test Tenant' },
    });
    tenantId = tenant.id;

    // 拠点作成
    const site = await prisma.site.create({
      data: {
        tenantId,
        name: 'Test Site',
        siteType: 'satellite_office',
      },
    });
    siteId = site.id;

    // Member 有りユーザー
    const memberUser = await prisma.user.create({
      data: {
        email: `completion-member-${Date.now()}@test.com`,
        passwordHash: 'dummy',
        name: 'Member User',
        role: 'R03',
        tenantId,
        siteId,
      },
    });
    memberUserId = memberUser.id;

    const member = await prisma.member.create({
      data: {
        userId: memberUserId,
        tenantId,
        siteId,
      },
    });
    memberId = member.id;

    memberToken = jwtService.sign({
      sub: memberUserId,
      email: memberUser.email,
      role: memberUser.role,
      tenantId,
    });

    // Member 無しユーザー
    const nonMemberUser = await prisma.user.create({
      data: {
        email: `completion-nonmember-${Date.now()}@test.com`,
        passwordHash: 'dummy',
        name: 'Non-Member User',
        role: 'R03',
        tenantId,
        siteId,
      },
    });
    nonMemberUserId = nonMemberUser.id;

    nonMemberToken = jwtService.sign({
      sub: nonMemberUserId,
      email: nonMemberUser.email,
      role: nonMemberUser.role,
      tenantId,
    });

    // マイクロタスク作成
    const microTask = await prisma.microTask.create({
      data: {
        taskCode: `TEST-COMP-${Date.now()}`,
        name: 'テスト用タスク',
        businessCategory: 'satellite_office',
        difficultyLevel: 2,
        isActive: true,
        tenantId,
        siteId,
      },
    });
    microTaskId = microTask.id;
  });

  afterAll(async () => {
    // FK順にクリーンアップ
    await prisma.taskAssignment.deleteMany({
      where: { memberId },
    });
    await prisma.microTask.deleteMany({
      where: { id: microTaskId },
    });
    await prisma.member.deleteMany({
      where: { id: memberId },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [memberUserId, nonMemberUserId] } },
    });
    await prisma.site.delete({ where: { id: siteId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  describe('POST /api/micro-tasks/:microTaskId/completions', () => {
    it('認証なしのリクエストは401を返す', () => {
      return request(app.getHttpServer())
        .post(`/api/micro-tasks/${microTaskId}/completions`)
        .send({})
        .expect(401);
    });

    it('Member 未登録ユーザーは403を返す', () => {
      return request(app.getHttpServer())
        .post(`/api/micro-tasks/${microTaskId}/completions`)
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .send({})
        .expect(403);
    });

    it('存在しないタスクIDは404を返す', () => {
      return request(app.getHttpServer())
        .post(
          '/api/micro-tasks/00000000-0000-0000-0000-000000000000/completions',
        )
        .set('Authorization', `Bearer ${memberToken}`)
        .send({})
        .expect(404);
    });

    it('正常に完了報告できる（201）', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/micro-tasks/${microTaskId}/completions`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({})
        .expect(201);

      expect(res.body).toMatchObject({
        memberId,
        microTaskId,
        status: 'completed',
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.completedAt).toBeDefined();
      expect(res.body.microTask).toMatchObject({
        name: 'テスト用タスク',
      });
    });

    it('notes 付きで完了報告できる', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/micro-tasks/${microTaskId}/completions`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ notes: '特に問題なく完了' })
        .expect(201);

      expect(res.body.notes).toBe('特に問題なく完了');
    });

    it('同一タスクを複数回完了報告できる（別IDが返る）', async () => {
      const res1 = await request(app.getHttpServer())
        .post(`/api/micro-tasks/${microTaskId}/completions`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({})
        .expect(201);

      const res2 = await request(app.getHttpServer())
        .post(`/api/micro-tasks/${microTaskId}/completions`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({})
        .expect(201);

      expect(res1.body.id).not.toBe(res2.body.id);
    });
  });
});
