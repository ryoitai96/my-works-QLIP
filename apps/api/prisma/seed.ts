import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ===== 固定UUID =====
const TENANT_ID = '00000000-0000-4000-a000-000000000001';

const SITE_FLOWER_LAB_ID = '00000000-0000-4000-a000-000000000010';
const SITE_SATELLITE_ID = '00000000-0000-4000-a000-000000000011';

const USER_ADMIN_ID = '00000000-0000-4000-a000-000000000100';
const USER_COACH_ID = '00000000-0000-4000-a000-000000000101';
const USER_MEMBER1_ID = '00000000-0000-4000-a000-000000000102';
const USER_MEMBER2_ID = '00000000-0000-4000-a000-000000000103';

const MEMBER1_ID = '00000000-0000-4000-a000-000000001001';
const MEMBER2_ID = '00000000-0000-4000-a000-000000001002';

async function main() {
  console.log('🌱 Seeding database...');

  // 開発用共通パスワード — bcryptで実ハッシュ生成
  const passwordHash = await bcrypt.hash('password123', 10);

  // ===== 1. Tenant =====
  const tenant = await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: { name: '株式会社SANN', industry: '人材サービス' },
    create: {
      id: TENANT_ID,
      name: '株式会社SANN',
      industry: '人材サービス',
      isActive: true,
    },
  });
  console.log(`  Tenant: ${tenant.name}`);

  // ===== 2. Sites =====
  const siteFlowerLab = await prisma.site.upsert({
    where: { id: SITE_FLOWER_LAB_ID },
    update: {
      name: 'フラワーラボ東京',
      siteType: 'flower_lab',
      address: '東京都渋谷区神南1-2-3',
    },
    create: {
      id: SITE_FLOWER_LAB_ID,
      tenantId: TENANT_ID,
      name: 'フラワーラボ東京',
      siteType: 'flower_lab',
      address: '東京都渋谷区神南1-2-3',
      isActive: true,
    },
  });

  const siteSatellite = await prisma.site.upsert({
    where: { id: SITE_SATELLITE_ID },
    update: {
      name: 'サテライトオフィス新宿',
      siteType: 'satellite_office',
      address: '東京都新宿区西新宿2-8-1',
    },
    create: {
      id: SITE_SATELLITE_ID,
      tenantId: TENANT_ID,
      name: 'サテライトオフィス新宿',
      siteType: 'satellite_office',
      address: '東京都新宿区西新宿2-8-1',
      isActive: true,
    },
  });
  console.log(`  Sites: ${siteFlowerLab.name}, ${siteSatellite.name}`);

  // ===== 3. Users =====
  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@sann.co.jp' },
    update: { name: '管理太郎', role: 'R01', passwordHash },
    create: {
      id: USER_ADMIN_ID,
      tenantId: TENANT_ID,
      siteId: null,
      email: 'admin@sann.co.jp',
      passwordHash: passwordHash,
      name: '管理太郎',
      role: 'R01',
      isActive: true,
    },
  });

  const userCoach = await prisma.user.upsert({
    where: { email: 'coach@sann.co.jp' },
    update: { name: '指導花子', role: 'R03', siteId: SITE_FLOWER_LAB_ID, passwordHash },
    create: {
      id: USER_COACH_ID,
      tenantId: TENANT_ID,
      siteId: SITE_FLOWER_LAB_ID,
      email: 'coach@sann.co.jp',
      passwordHash: passwordHash,
      name: '指導花子',
      role: 'R03',
      isActive: true,
    },
  });

  const userMember1 = await prisma.user.upsert({
    where: { email: 'member1@sann.co.jp' },
    update: { name: '田中一郎', role: 'R04', siteId: SITE_FLOWER_LAB_ID, passwordHash },
    create: {
      id: USER_MEMBER1_ID,
      tenantId: TENANT_ID,
      siteId: SITE_FLOWER_LAB_ID,
      email: 'member1@sann.co.jp',
      passwordHash: passwordHash,
      name: '田中一郎',
      role: 'R04',
      isActive: true,
    },
  });

  const userMember2 = await prisma.user.upsert({
    where: { email: 'member2@sann.co.jp' },
    update: { name: '鈴木次郎', role: 'R04', siteId: SITE_SATELLITE_ID, passwordHash },
    create: {
      id: USER_MEMBER2_ID,
      tenantId: TENANT_ID,
      siteId: SITE_SATELLITE_ID,
      email: 'member2@sann.co.jp',
      passwordHash: passwordHash,
      name: '鈴木次郎',
      role: 'R04',
      isActive: true,
    },
  });
  console.log(
    `  Users: ${userAdmin.name}, ${userCoach.name}, ${userMember1.name}, ${userMember2.name}`,
  );

  // ===== 4. Members =====
  const member1 = await prisma.member.upsert({
    where: { userId: USER_MEMBER1_ID },
    update: {
      employeeNumber: 'EMP-001',
      disabilityType: 'intellectual',
      employmentType: 'permanent',
      status: 'active',
    },
    create: {
      id: MEMBER1_ID,
      userId: USER_MEMBER1_ID,
      tenantId: TENANT_ID,
      siteId: SITE_FLOWER_LAB_ID,
      employeeNumber: 'EMP-001',
      disabilityType: 'intellectual',
      employmentType: 'permanent',
      status: 'active',
    },
  });

  const member2 = await prisma.member.upsert({
    where: { userId: USER_MEMBER2_ID },
    update: {
      employeeNumber: 'EMP-002',
      disabilityType: 'mental',
      employmentType: 'fixed_term',
      status: 'active',
    },
    create: {
      id: MEMBER2_ID,
      userId: USER_MEMBER2_ID,
      tenantId: TENANT_ID,
      siteId: SITE_SATELLITE_ID,
      employeeNumber: 'EMP-002',
      disabilityType: 'mental',
      employmentType: 'fixed_term',
      status: 'active',
    },
  });
  console.log(`  Members: ${member1.employeeNumber}, ${member2.employeeNumber}`);

  // ===== 5. MicroTasks =====
  const microTasks = [
    // --- Flower Lab (FL-001〜008) ---
    {
      taskCode: 'FL-001',
      name: '花材の検品・選別',
      businessCategory: 'flower_lab',
      category: '下処理',
      requiredSkillTags: ['視覚認知', '色彩識別'],
      difficultyLevel: 2,
      standardDuration: 15,
      physicalLoad: 'low',
      cognitiveLoad: 'medium',
      siteId: SITE_FLOWER_LAB_ID,
    },
    {
      taskCode: 'FL-002',
      name: '水揚げ・茎カット',
      businessCategory: 'flower_lab',
      category: '下処理',
      requiredSkillTags: ['手先の器用さ', '反復耐性'],
      difficultyLevel: 1,
      standardDuration: 10,
      physicalLoad: 'medium',
      cognitiveLoad: 'low',
      siteId: SITE_FLOWER_LAB_ID,
    },
    {
      taskCode: 'FL-003',
      name: 'ドライフラワー乾燥セット',
      businessCategory: 'flower_lab',
      category: '加工',
      requiredSkillTags: ['空間認知', '手順遵守'],
      difficultyLevel: 2,
      standardDuration: 20,
      physicalLoad: 'low',
      cognitiveLoad: 'medium',
      siteId: SITE_FLOWER_LAB_ID,
    },
    {
      taskCode: 'FL-004',
      name: 'アレンジメントデザイン',
      businessCategory: 'flower_lab',
      category: '制作',
      requiredSkillTags: ['色彩感覚', '創造性', '空間構成'],
      difficultyLevel: 4,
      standardDuration: 30,
      physicalLoad: 'low',
      cognitiveLoad: 'high',
      siteId: SITE_FLOWER_LAB_ID,
    },
    {
      taskCode: 'FL-005',
      name: '梱包・箱詰め',
      businessCategory: 'flower_lab',
      category: '出荷',
      requiredSkillTags: ['反復耐性', '手順遵守'],
      difficultyLevel: 1,
      standardDuration: 10,
      physicalLoad: 'medium',
      cognitiveLoad: 'low',
      siteId: SITE_FLOWER_LAB_ID,
    },
    {
      taskCode: 'FL-006',
      name: 'メッセージカード作成',
      businessCategory: 'flower_lab',
      category: '制作',
      requiredSkillTags: ['文字記述', '丁寧さ'],
      difficultyLevel: 3,
      standardDuration: 15,
      physicalLoad: 'low',
      cognitiveLoad: 'medium',
      siteId: SITE_FLOWER_LAB_ID,
    },
    {
      taskCode: 'FL-007',
      name: '品質検査',
      businessCategory: 'flower_lab',
      category: 'QC',
      requiredSkillTags: ['注意力', '基準照合'],
      difficultyLevel: 3,
      standardDuration: 5,
      physicalLoad: 'low',
      cognitiveLoad: 'high',
      siteId: SITE_FLOWER_LAB_ID,
    },
    {
      taskCode: 'FL-008',
      name: '在庫棚卸し・整理',
      businessCategory: 'flower_lab',
      category: '管理',
      requiredSkillTags: ['数量認知', '分類能力'],
      difficultyLevel: 2,
      standardDuration: 30,
      physicalLoad: 'medium',
      cognitiveLoad: 'medium',
      siteId: SITE_FLOWER_LAB_ID,
    },
    // --- Satellite Office (SO-001〜006) ---
    {
      taskCode: 'SO-001',
      name: 'データ入力（定型）',
      businessCategory: 'satellite_office',
      category: '事務',
      requiredSkillTags: ['PC操作', '正確性', '反復耐性'],
      difficultyLevel: 2,
      standardDuration: 60,
      physicalLoad: 'low',
      cognitiveLoad: 'medium',
      siteId: SITE_SATELLITE_ID,
    },
    {
      taskCode: 'SO-002',
      name: '書類スキャン・PDF化',
      businessCategory: 'satellite_office',
      category: '事務',
      requiredSkillTags: ['機器操作', '手順遵守'],
      difficultyLevel: 1,
      standardDuration: 30,
      physicalLoad: 'low',
      cognitiveLoad: 'low',
      siteId: SITE_SATELLITE_ID,
    },
    {
      taskCode: 'SO-003',
      name: 'データクレンジング',
      businessCategory: 'satellite_office',
      category: '事務',
      requiredSkillTags: ['PC操作', '注意力', '論理性'],
      difficultyLevel: 3,
      standardDuration: 60,
      physicalLoad: 'low',
      cognitiveLoad: 'high',
      siteId: SITE_SATELLITE_ID,
    },
    {
      taskCode: 'SO-004',
      name: '封入・発送準備',
      businessCategory: 'satellite_office',
      category: '軽作業',
      requiredSkillTags: ['反復耐性', '手順遵守'],
      difficultyLevel: 1,
      standardDuration: 20,
      physicalLoad: 'medium',
      cognitiveLoad: 'low',
      siteId: SITE_SATELLITE_ID,
    },
    {
      taskCode: 'SO-005',
      name: '清掃（共有スペース）',
      businessCategory: 'satellite_office',
      category: '清掃',
      requiredSkillTags: ['体力', '手順遵守'],
      difficultyLevel: 1,
      standardDuration: 30,
      physicalLoad: 'high',
      cognitiveLoad: 'low',
      siteId: SITE_SATELLITE_ID,
    },
    {
      taskCode: 'SO-006',
      name: 'リスト作成・集計',
      businessCategory: 'satellite_office',
      category: '事務',
      requiredSkillTags: ['PC操作', 'Excel基本'],
      difficultyLevel: 3,
      standardDuration: 45,
      physicalLoad: 'low',
      cognitiveLoad: 'high',
      siteId: SITE_SATELLITE_ID,
    },
  ];

  for (const task of microTasks) {
    await prisma.microTask.upsert({
      where: { taskCode: task.taskCode },
      update: {
        name: task.name,
        businessCategory: task.businessCategory,
        category: task.category,
        requiredSkillTags: task.requiredSkillTags,
        difficultyLevel: task.difficultyLevel,
        standardDuration: task.standardDuration,
        physicalLoad: task.physicalLoad,
        cognitiveLoad: task.cognitiveLoad,
        siteId: task.siteId,
      },
      create: {
        tenantId: TENANT_ID,
        siteId: task.siteId,
        taskCode: task.taskCode,
        name: task.name,
        businessCategory: task.businessCategory,
        category: task.category,
        requiredSkillTags: task.requiredSkillTags,
        difficultyLevel: task.difficultyLevel,
        standardDuration: task.standardDuration,
        physicalLoad: task.physicalLoad,
        cognitiveLoad: task.cognitiveLoad,
        isActive: true,
      },
    });
  }
  console.log(`  MicroTasks: ${microTasks.length} tasks upserted`);

  // ===== 6. TaskAssignments =====
  const TASK_ASSIGNMENT_IDS = [
    '00000000-0000-4000-a000-000000002001',
    '00000000-0000-4000-a000-000000002002',
    '00000000-0000-4000-a000-000000002003',
    '00000000-0000-4000-a000-000000002004',
    '00000000-0000-4000-a000-000000002005',
    '00000000-0000-4000-a000-000000002006',
    '00000000-0000-4000-a000-000000002007',
    '00000000-0000-4000-a000-000000002008',
  ];

  // Get micro task IDs
  const flowerTasks = await prisma.microTask.findMany({
    where: { siteId: SITE_FLOWER_LAB_ID },
    select: { id: true, taskCode: true },
    orderBy: { taskCode: 'asc' },
  });
  const satelliteTasks = await prisma.microTask.findMany({
    where: { siteId: SITE_SATELLITE_ID },
    select: { id: true, taskCode: true },
    orderBy: { taskCode: 'asc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const taskAssignments = [
    // Member1 (Flower Lab) — today completed
    {
      id: TASK_ASSIGNMENT_IDS[0],
      memberId: MEMBER1_ID,
      microTaskId: flowerTasks[0]?.id,
      assignedById: USER_COACH_ID,
      assignedDate: today,
      status: 'completed',
      completedAt: new Date(),
    },
    {
      id: TASK_ASSIGNMENT_IDS[1],
      memberId: MEMBER1_ID,
      microTaskId: flowerTasks[1]?.id,
      assignedById: USER_COACH_ID,
      assignedDate: today,
      status: 'completed',
      completedAt: new Date(),
    },
    {
      id: TASK_ASSIGNMENT_IDS[2],
      memberId: MEMBER1_ID,
      microTaskId: flowerTasks[2]?.id,
      assignedById: USER_COACH_ID,
      assignedDate: today,
      status: 'assigned',
    },
    // Member1 — yesterday completed
    {
      id: TASK_ASSIGNMENT_IDS[3],
      memberId: MEMBER1_ID,
      microTaskId: flowerTasks[3]?.id,
      assignedById: USER_COACH_ID,
      assignedDate: yesterday,
      status: 'completed',
      completedAt: yesterday,
    },
    // Member2 (Satellite) — today
    {
      id: TASK_ASSIGNMENT_IDS[4],
      memberId: MEMBER2_ID,
      microTaskId: satelliteTasks[0]?.id,
      assignedById: USER_ADMIN_ID,
      assignedDate: today,
      status: 'completed',
      completedAt: new Date(),
    },
    {
      id: TASK_ASSIGNMENT_IDS[5],
      memberId: MEMBER2_ID,
      microTaskId: satelliteTasks[1]?.id,
      assignedById: USER_ADMIN_ID,
      assignedDate: today,
      status: 'in_progress',
      startedAt: new Date(),
    },
    // Member2 — two days ago
    {
      id: TASK_ASSIGNMENT_IDS[6],
      memberId: MEMBER2_ID,
      microTaskId: satelliteTasks[2]?.id,
      assignedById: USER_ADMIN_ID,
      assignedDate: twoDaysAgo,
      status: 'completed',
      completedAt: twoDaysAgo,
    },
    {
      id: TASK_ASSIGNMENT_IDS[7],
      memberId: MEMBER2_ID,
      microTaskId: satelliteTasks[3]?.id,
      assignedById: USER_ADMIN_ID,
      assignedDate: twoDaysAgo,
      status: 'completed',
      completedAt: twoDaysAgo,
    },
  ];

  for (const ta of taskAssignments) {
    if (!ta.microTaskId) continue;
    await prisma.taskAssignment.upsert({
      where: { id: ta.id },
      update: { status: ta.status, completedAt: ta.completedAt, startedAt: ta.startedAt },
      create: {
        id: ta.id,
        memberId: ta.memberId,
        microTaskId: ta.microTaskId,
        assignedById: ta.assignedById,
        assignedDate: ta.assignedDate,
        status: ta.status,
        startedAt: ta.startedAt,
        completedAt: ta.completedAt,
      },
    });
  }
  console.log(`  TaskAssignments: ${taskAssignments.length} upserted`);

  // ===== 7. ThanksCards =====
  const THANKS_IDS = [
    '00000000-0000-4000-a000-000000003001',
    '00000000-0000-4000-a000-000000003002',
    '00000000-0000-4000-a000-000000003003',
    '00000000-0000-4000-a000-000000003004',
    '00000000-0000-4000-a000-000000003005',
  ];

  const thanksCards = [
    {
      id: THANKS_IDS[0],
      fromUserId: USER_COACH_ID,
      toUserId: USER_MEMBER1_ID,
      content: '今日も丁寧にお花の検品をしてくれてありがとう！',
      category: 'great_job',
    },
    {
      id: THANKS_IDS[1],
      fromUserId: USER_MEMBER1_ID,
      toUserId: USER_COACH_ID,
      content: '優しく教えてくださりありがとうございます。',
      category: 'kindness',
    },
    {
      id: THANKS_IDS[2],
      fromUserId: USER_ADMIN_ID,
      toUserId: USER_MEMBER2_ID,
      content: 'データ入力の正確さが素晴らしいです！',
      category: 'great_job',
    },
    {
      id: THANKS_IDS[3],
      fromUserId: USER_MEMBER2_ID,
      toUserId: USER_MEMBER1_ID,
      content: '一緒にがんばれて嬉しいです。',
      category: 'teamwork',
    },
    {
      id: THANKS_IDS[4],
      fromUserId: USER_COACH_ID,
      toUserId: USER_MEMBER2_ID,
      content: '新しいアレンジメントのアイデア、とても素敵でした！',
      category: 'creativity',
    },
  ];

  for (const tc of thanksCards) {
    await prisma.thanksCard.upsert({
      where: { id: tc.id },
      update: { content: tc.content, category: tc.category },
      create: tc,
    });
  }
  console.log(`  ThanksCards: ${thanksCards.length} upserted`);

  // ===== 8. VitalScores =====
  const VITAL_IDS = [
    '00000000-0000-4000-a000-000000004001',
    '00000000-0000-4000-a000-000000004002',
    '00000000-0000-4000-a000-000000004003',
    '00000000-0000-4000-a000-000000004004',
    '00000000-0000-4000-a000-000000004005',
    '00000000-0000-4000-a000-000000004006',
  ];

  const vitalScores = [
    // Member1 — today
    { id: VITAL_IDS[0], memberId: MEMBER1_ID, recordDate: today, mood: 4, sleep: 3, condition: 4, streakDays: 3 },
    // Member1 — yesterday
    { id: VITAL_IDS[1], memberId: MEMBER1_ID, recordDate: yesterday, mood: 3, sleep: 4, condition: 3, streakDays: 2 },
    // Member1 — two days ago
    { id: VITAL_IDS[2], memberId: MEMBER1_ID, recordDate: twoDaysAgo, mood: 4, sleep: 4, condition: 4, streakDays: 1 },
    // Member2 — today
    { id: VITAL_IDS[3], memberId: MEMBER2_ID, recordDate: today, mood: 5, sleep: 5, condition: 4, streakDays: 2 },
    // Member2 — yesterday
    { id: VITAL_IDS[4], memberId: MEMBER2_ID, recordDate: yesterday, mood: 4, sleep: 4, condition: 5, streakDays: 1 },
    // Member2 — two days ago
    { id: VITAL_IDS[5], memberId: MEMBER2_ID, recordDate: twoDaysAgo, mood: 3, sleep: 3, condition: 3, streakDays: 0 },
  ];

  for (const vs of vitalScores) {
    await prisma.vitalScore.upsert({
      where: { memberId_recordDate: { memberId: vs.memberId, recordDate: vs.recordDate } },
      update: { mood: vs.mood, sleep: vs.sleep, condition: vs.condition, streakDays: vs.streakDays },
      create: vs,
    });
  }
  console.log(`  VitalScores: ${vitalScores.length} upserted`);

  // ===== Summary =====
  const counts = {
    tenants: await prisma.tenant.count(),
    sites: await prisma.site.count(),
    users: await prisma.user.count(),
    members: await prisma.member.count(),
    microTasks: await prisma.microTask.count(),
    taskAssignments: await prisma.taskAssignment.count(),
    thanksCards: await prisma.thanksCard.count(),
    vitalScores: await prisma.vitalScore.count(),
  };
  console.log('\n📊 Seed summary:');
  console.log(`  Tenants:         ${counts.tenants}`);
  console.log(`  Sites:           ${counts.sites}`);
  console.log(`  Users:           ${counts.users}`);
  console.log(`  Members:         ${counts.members}`);
  console.log(`  MicroTasks:      ${counts.microTasks}`);
  console.log(`  TaskAssignments: ${counts.taskAssignments}`);
  console.log(`  ThanksCards:     ${counts.thanksCards}`);
  console.log(`  VitalScores:     ${counts.vitalScores}`);
  console.log('\n✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
