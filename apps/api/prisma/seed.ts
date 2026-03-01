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

  // ===== Summary =====
  const counts = {
    tenants: await prisma.tenant.count(),
    sites: await prisma.site.count(),
    users: await prisma.user.count(),
    members: await prisma.member.count(),
    microTasks: await prisma.microTask.count(),
  };
  console.log('\n📊 Seed summary:');
  console.log(`  Tenants:    ${counts.tenants}`);
  console.log(`  Sites:      ${counts.sites}`);
  console.log(`  Users:      ${counts.users}`);
  console.log(`  Members:    ${counts.members}`);
  console.log(`  MicroTasks: ${counts.microTasks}`);
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
