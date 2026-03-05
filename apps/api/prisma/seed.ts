import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ===== 固定UUID =====
const TENANT_ID = '00000000-0000-4000-a000-000000000001';
const TENANT_B_ID = '00000000-0000-4000-a000-000000000002';
const TENANT_C_ID = '00000000-0000-4000-a000-000000000003';

const SITE_FLOWER_LAB_ID = '00000000-0000-4000-a000-000000000010';
const SITE_SATELLITE_ID = '00000000-0000-4000-a000-000000000011';
const SITE_B_YOKOHAMA_ID = '00000000-0000-4000-a000-000000000012';
const SITE_C_OSAKA_ID = '00000000-0000-4000-a000-000000000013';

const USER_ADMIN_ID = '00000000-0000-4000-a000-000000000100';
const USER_COACH_ID = '00000000-0000-4000-a000-000000000101';
const USER_MEMBER1_ID = '00000000-0000-4000-a000-000000000102';
const USER_MEMBER2_ID = '00000000-0000-4000-a000-000000000103';
const USER_CLIENT_HR_ID = '00000000-0000-4000-a000-000000000104';
const USER_CLIENT_EMP_ID = '00000000-0000-4000-a000-000000000105';
const USER_B_HR_ID = '00000000-0000-4000-a000-000000000106';
const USER_B_EMP_ID = '00000000-0000-4000-a000-000000000107';
const USER_C_HR_ID = '00000000-0000-4000-a000-000000000108';
const USER_C_EMP_ID = '00000000-0000-4000-a000-000000000109';

const MEMBER1_ID = '00000000-0000-4000-a000-000000001001';
const MEMBER2_ID = '00000000-0000-4000-a000-000000001002';

async function main() {
  console.log('🌱 Seeding database...');

  // 開発用共通パスワード — bcryptで実ハッシュ生成
  const passwordHash = await bcrypt.hash('password123', 10);

  // ===== 1. Tenant =====
  const tenant = await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: { name: '株式会社A', industry: '人材サービス', tenantCode: 'T-001' },
    create: {
      id: TENANT_ID,
      tenantCode: 'T-001',
      name: '株式会社A',
      industry: '人材サービス',
      isActive: true,
    },
  });
  // 株式会社B: フラワーギフトとサンクスカードをOFF
  const tenantB = await prisma.tenant.upsert({
    where: { id: TENANT_B_ID },
    update: {
      name: '株式会社B',
      industry: '製造業',
      tenantCode: 'T-002',
      svcFlowerOrder: false,
      svcThanks: false,
    },
    create: {
      id: TENANT_B_ID,
      tenantCode: 'T-002',
      name: '株式会社B',
      industry: '製造業',
      isActive: true,
      svcFlowerOrder: false,
      svcThanks: false,
    },
  });

  // 株式会社C: メッセージとアセスメントをOFF
  const tenantC = await prisma.tenant.upsert({
    where: { id: TENANT_C_ID },
    update: {
      name: '株式会社C',
      industry: 'IT・通信',
      tenantCode: 'T-003',
      svcMessage: false,
      svcAssessment: false,
    },
    create: {
      id: TENANT_C_ID,
      tenantCode: 'T-003',
      name: '株式会社C',
      industry: 'IT・通信',
      isActive: true,
      svcMessage: false,
      svcAssessment: false,
    },
  });

  console.log(`  Tenants: ${tenant.name}, ${tenantB.name}, ${tenantC.name}`);

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
  const siteBYokohama = await prisma.site.upsert({
    where: { id: SITE_B_YOKOHAMA_ID },
    update: {
      name: 'サテライトオフィス横浜',
      siteType: 'satellite_office',
      address: '神奈川県横浜市西区みなとみらい2-3-1',
    },
    create: {
      id: SITE_B_YOKOHAMA_ID,
      tenantId: TENANT_B_ID,
      name: 'サテライトオフィス横浜',
      siteType: 'satellite_office',
      address: '神奈川県横浜市西区みなとみらい2-3-1',
      isActive: true,
    },
  });

  const siteCOsaka = await prisma.site.upsert({
    where: { id: SITE_C_OSAKA_ID },
    update: {
      name: 'リモートオフィス大阪',
      siteType: 'satellite_office',
      address: '大阪府大阪市北区梅田1-1-1',
    },
    create: {
      id: SITE_C_OSAKA_ID,
      tenantId: TENANT_C_ID,
      name: 'リモートオフィス大阪',
      siteType: 'satellite_office',
      address: '大阪府大阪市北区梅田1-1-1',
      isActive: true,
    },
  });

  console.log(`  Sites: ${siteFlowerLab.name}, ${siteSatellite.name}, ${siteBYokohama.name}, ${siteCOsaka.name}`);

  // ===== 3. Users =====
  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@sann.co.jp' },
    update: { name: '管理太郎', role: 'R01', passwordHash, userCode: 'U-001' },
    create: {
      id: USER_ADMIN_ID,
      userCode: 'U-001',
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
    update: { name: '指導花子', role: 'R02', siteId: SITE_FLOWER_LAB_ID, passwordHash, userCode: 'U-002' },
    create: {
      id: USER_COACH_ID,
      userCode: 'U-002',
      tenantId: TENANT_ID,
      siteId: SITE_FLOWER_LAB_ID,
      email: 'coach@sann.co.jp',
      passwordHash: passwordHash,
      name: '指導花子',
      role: 'R02',
      isActive: true,
    },
  });

  const userMember1 = await prisma.user.upsert({
    where: { email: 'member1@sann.co.jp' },
    update: { name: '田中一郎', role: 'R03', siteId: SITE_FLOWER_LAB_ID, passwordHash, userCode: 'U-003' },
    create: {
      id: USER_MEMBER1_ID,
      userCode: 'U-003',
      tenantId: TENANT_ID,
      siteId: SITE_FLOWER_LAB_ID,
      email: 'member1@sann.co.jp',
      passwordHash: passwordHash,
      name: '田中一郎',
      role: 'R03',
      isActive: true,
    },
  });

  const userMember2 = await prisma.user.upsert({
    where: { email: 'member2@sann.co.jp' },
    update: { name: '鈴木次郎', role: 'R03', siteId: SITE_SATELLITE_ID, passwordHash, userCode: 'U-004' },
    create: {
      id: USER_MEMBER2_ID,
      userCode: 'U-004',
      tenantId: TENANT_ID,
      siteId: SITE_SATELLITE_ID,
      email: 'member2@sann.co.jp',
      passwordHash: passwordHash,
      name: '鈴木次郎',
      role: 'R03',
      isActive: true,
    },
  });
  const userClientHr = await prisma.user.upsert({
    where: { email: 'hr@client.co.jp' },
    update: { name: '佐藤美咲', role: 'R04', passwordHash, userCode: 'U-005' },
    create: {
      id: USER_CLIENT_HR_ID,
      userCode: 'U-005',
      tenantId: TENANT_ID,
      siteId: null,
      email: 'hr@client.co.jp',
      passwordHash: passwordHash,
      name: '佐藤美咲',
      role: 'R04',
      isActive: true,
    },
  });

  const userClientEmp = await prisma.user.upsert({
    where: { email: 'emp@client.co.jp' },
    update: { name: '高橋健太', role: 'R05', passwordHash, userCode: 'U-006' },
    create: {
      id: USER_CLIENT_EMP_ID,
      userCode: 'U-006',
      tenantId: TENANT_ID,
      siteId: null,
      email: 'emp@client.co.jp',
      passwordHash: passwordHash,
      name: '高橋健太',
      role: 'R05',
      isActive: true,
    },
  });

  // --- 株式会社B ユーザー ---
  const userBHr = await prisma.user.upsert({
    where: { email: 'hr@companyb.co.jp' },
    update: { name: '山田花子', role: 'R04', passwordHash, userCode: 'U-007' },
    create: {
      id: USER_B_HR_ID,
      userCode: 'U-007',
      tenantId: TENANT_B_ID,
      siteId: null,
      email: 'hr@companyb.co.jp',
      passwordHash,
      name: '山田花子',
      role: 'R04',
      isActive: true,
    },
  });

  const userBEmp = await prisma.user.upsert({
    where: { email: 'emp@companyb.co.jp' },
    update: { name: '中村大輔', role: 'R05', passwordHash, userCode: 'U-008' },
    create: {
      id: USER_B_EMP_ID,
      userCode: 'U-008',
      tenantId: TENANT_B_ID,
      siteId: null,
      email: 'emp@companyb.co.jp',
      passwordHash,
      name: '中村大輔',
      role: 'R05',
      isActive: true,
    },
  });

  // --- 株式会社C ユーザー ---
  const userCHr = await prisma.user.upsert({
    where: { email: 'hr@companyc.co.jp' },
    update: { name: '小林真由美', role: 'R04', passwordHash, userCode: 'U-009' },
    create: {
      id: USER_C_HR_ID,
      userCode: 'U-009',
      tenantId: TENANT_C_ID,
      siteId: null,
      email: 'hr@companyc.co.jp',
      passwordHash,
      name: '小林真由美',
      role: 'R04',
      isActive: true,
    },
  });

  const userCEmp = await prisma.user.upsert({
    where: { email: 'emp@companyc.co.jp' },
    update: { name: '渡辺翔太', role: 'R05', passwordHash, userCode: 'U-010' },
    create: {
      id: USER_C_EMP_ID,
      userCode: 'U-010',
      tenantId: TENANT_C_ID,
      siteId: null,
      email: 'emp@companyc.co.jp',
      passwordHash,
      name: '渡辺翔太',
      role: 'R05',
      isActive: true,
    },
  });

  console.log(
    `  Users: ${userAdmin.name}, ${userCoach.name}, ${userMember1.name}, ${userMember2.name}, ${userClientHr.name}, ${userClientEmp.name}, ${userBHr.name}, ${userBEmp.name}, ${userCHr.name}, ${userCEmp.name}`,
  );

  // ===== 4. Members =====
  const member1 = await prisma.member.upsert({
    where: { userId: USER_MEMBER1_ID },
    update: {
      employeeNumber: 'EMP-001',
      disabilityType: 'intellectual',
      employmentType: 'permanent',
      status: 'active',
      avatarId: 'avatar-03',
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
      avatarId: 'avatar-03',
    },
  });

  const member2 = await prisma.member.upsert({
    where: { userId: USER_MEMBER2_ID },
    update: {
      employeeNumber: 'EMP-002',
      disabilityType: 'mental',
      employmentType: 'fixed_term',
      status: 'active',
      avatarId: 'avatar-07',
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
      avatarId: 'avatar-07',
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
      fromUserId: USER_CLIENT_HR_ID,   // 佐藤美咲（R04・人事）→ 田中一郎（R03）
      toUserId: USER_MEMBER1_ID,
      content: '素敵なドライフラワーフレームをありがとうございます！オフィスに飾っています。',
      category: 'warm_thanks',
    },
    {
      id: THANKS_IDS[1],
      fromUserId: USER_CLIENT_EMP_ID,  // 高橋健太（R05・社員）→ 田中一郎（R03）
      toUserId: USER_MEMBER1_ID,
      content: '誕生日に届いたガーベラの花束、とても元気をもらいました！',
      category: 'cheer_up',
    },
    {
      id: THANKS_IDS[2],
      fromUserId: USER_CLIENT_EMP_ID,  // 高橋健太（R05・社員）→ 鈴木次郎（R03）
      toUserId: USER_MEMBER2_ID,
      content: 'ミニブーケがとても綺麗で感動しました。丁寧なお仕事ですね。',
      category: 'warm_thanks',
    },
    {
      id: THANKS_IDS[3],
      fromUserId: USER_CLIENT_HR_ID,   // 佐藤美咲（R04・人事）→ 鈴木次郎（R03）
      toUserId: USER_MEMBER2_ID,
      content: 'チューリップのアレンジメント、会議室が明るくなりました。ありがとう！',
      category: 'calm_relax',
    },
    {
      id: THANKS_IDS[4],
      fromUserId: USER_CLIENT_HR_ID,   // 佐藤美咲（R04・人事）→ 田中一郎（R03）
      toUserId: USER_MEMBER1_ID,
      content: 'ハーバリウムのデザイン、とてもセンスがいいですね。集中力がすごい！',
      category: 'focus_clear',
    },
  ];

  for (const tc of thanksCards) {
    await prisma.thanksCard.upsert({
      where: { id: tc.id },
      update: { fromUserId: tc.fromUserId, toUserId: tc.toUserId, content: tc.content, category: tc.category },
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
    { id: VITAL_IDS[0], memberId: MEMBER1_ID, recordDate: today, mood: 4, sleep: 3, condition: 4, bodyTemperature: 36.5, mealBreakfast: true, mealLunch: true, mealDinner: false, streakDays: 3 },
    // Member1 — yesterday
    { id: VITAL_IDS[1], memberId: MEMBER1_ID, recordDate: yesterday, mood: 3, sleep: 4, condition: 3, bodyTemperature: 36.8, mealBreakfast: true, mealLunch: false, mealDinner: true, streakDays: 2 },
    // Member1 — two days ago
    { id: VITAL_IDS[2], memberId: MEMBER1_ID, recordDate: twoDaysAgo, mood: 4, sleep: 4, condition: 4, bodyTemperature: null, mealBreakfast: null, mealLunch: null, mealDinner: null, streakDays: 1 },
    // Member2 — today
    { id: VITAL_IDS[3], memberId: MEMBER2_ID, recordDate: today, mood: 5, sleep: 5, condition: 4, bodyTemperature: 36.2, mealBreakfast: true, mealLunch: true, mealDinner: true, streakDays: 2 },
    // Member2 — yesterday
    { id: VITAL_IDS[4], memberId: MEMBER2_ID, recordDate: yesterday, mood: 4, sleep: 4, condition: 5, bodyTemperature: 36.4, mealBreakfast: false, mealLunch: true, mealDinner: true, streakDays: 1 },
    // Member2 — two days ago
    { id: VITAL_IDS[5], memberId: MEMBER2_ID, recordDate: twoDaysAgo, mood: 3, sleep: 3, condition: 3, bodyTemperature: null, mealBreakfast: null, mealLunch: null, mealDinner: null, streakDays: 0 },
  ];

  for (const vs of vitalScores) {
    await prisma.vitalScore.upsert({
      where: { memberId_recordDate: { memberId: vs.memberId, recordDate: vs.recordDate } },
      update: { mood: vs.mood, sleep: vs.sleep, condition: vs.condition, bodyTemperature: vs.bodyTemperature, mealBreakfast: vs.mealBreakfast, mealLunch: vs.mealLunch, mealDinner: vs.mealDinner, streakDays: vs.streakDays },
      create: vs,
    });
  }
  console.log(`  VitalScores: ${vitalScores.length} upserted`);

  // ===== 9. FlowerProducts =====
  const flowerProducts = [
    {
      productCode: 'FP-001',
      name: 'ミニブーケ（バラ）',
      category: 'バラ',
      price: 1500,
      description: 'デスクに飾れるミニサイズのバラブーケ。赤・ピンク・白から選べます。',
    },
    {
      productCode: 'FP-002',
      name: 'チューリップアレンジメント',
      category: 'チューリップ',
      price: 2000,
      description: '春の彩りを届けるチューリップのアレンジメント。',
    },
    {
      productCode: 'FP-003',
      name: 'ドライフラワーフレーム',
      category: 'ドライフラワー',
      price: 2500,
      description: 'フレームに収めたドライフラワー。長く楽しめるインテリアギフト。',
    },
    {
      productCode: 'FP-004',
      name: 'ガーベラの花束',
      category: 'ガーベラ',
      price: 1800,
      description: '明るいガーベラの花束。元気を届けたいときに。',
    },
    {
      productCode: 'FP-005',
      name: 'ハーバリウムボトル',
      category: 'ハーバリウム',
      price: 3000,
      description: 'オイルに浮かぶ花が美しいハーバリウム。手作りの温もりを感じるギフト。',
    },
  ];

  for (const fp of flowerProducts) {
    await prisma.flowerProduct.upsert({
      where: { productCode: fp.productCode },
      update: {
        name: fp.name,
        category: fp.category,
        price: fp.price,
        description: fp.description,
      },
      create: {
        ...fp,
        isActive: true,
      },
    });
  }
  console.log(`  FlowerProducts: ${flowerProducts.length} upserted`);

  // ===== 10. FlowerOrders =====
  const ORDER_IDS = [
    '00000000-0000-4000-a000-000000006001',
    '00000000-0000-4000-a000-000000006002',
    '00000000-0000-4000-a000-000000006003',
  ];

  const flowerProductRecords = await prisma.flowerProduct.findMany({
    orderBy: { productCode: 'asc' },
  });

  const flowerOrders = [
    {
      id: ORDER_IDS[0],
      orderCode: 'ORD-001',
      userId: USER_CLIENT_EMP_ID,
      flowerProductId: flowerProductRecords[0]?.id,
      quantity: 2,
      totalPrice: (flowerProductRecords[0]?.price ?? 0) * 2,
      message: 'いつもお疲れ様です。ありがとうございます。',
      recipientName: '山田太郎',
      recipientAddress: null,
      status: 'confirmed',
    },
    {
      id: ORDER_IDS[1],
      orderCode: 'ORD-002',
      userId: USER_CLIENT_HR_ID,
      flowerProductId: flowerProductRecords[2]?.id,
      quantity: 1,
      totalPrice: flowerProductRecords[2]?.price ?? 0,
      message: null,
      recipientName: null,
      recipientAddress: null,
      status: 'pending',
    },
    {
      id: ORDER_IDS[2],
      orderCode: 'ORD-003',
      userId: USER_CLIENT_EMP_ID,
      flowerProductId: flowerProductRecords[3]?.id,
      quantity: 1,
      totalPrice: flowerProductRecords[3]?.price ?? 0,
      message: 'お誕生日おめでとうございます！',
      recipientName: '佐藤花子',
      recipientAddress: '東京都千代田区丸の内1-1-1',
      status: 'delivered',
    },
  ];

  for (const fo of flowerOrders) {
    if (!fo.flowerProductId) continue;
    await prisma.flowerOrder.upsert({
      where: { id: fo.id },
      update: {
        status: fo.status,
        quantity: fo.quantity,
        totalPrice: fo.totalPrice,
        message: fo.message,
        recipientName: fo.recipientName,
        recipientAddress: fo.recipientAddress,
      },
      create: fo,
    });
  }
  console.log(`  FlowerOrders: ${flowerOrders.length} upserted`);

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
    flowerProducts: await prisma.flowerProduct.count(),
    flowerOrders: await prisma.flowerOrder.count(),
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
  console.log(`  FlowerProducts:  ${counts.flowerProducts}`);
  console.log(`  FlowerOrders:    ${counts.flowerOrders}`);
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
