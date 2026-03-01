-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siteType" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "siteId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "employeeNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "disabilityType" TEXT,
    "disabilityGrade" TEXT,
    "handbookType" TEXT,
    "handbookIssuedAt" TIMESTAMP(3),
    "handbookExpiresAt" TIMESTAMP(3),
    "workExperience" TEXT,
    "preferredWorkAreas" TEXT,
    "employmentType" TEXT,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characteristic_profiles" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "visualCognition" INTEGER,
    "auditoryCognition" INTEGER,
    "dexterity" INTEGER,
    "physicalEndurance" INTEGER,
    "repetitiveWorkTolerance" INTEGER,
    "adaptability" INTEGER,
    "interpersonalCommunication" INTEGER,
    "concentrationDuration" INTEGER,
    "stressTolerance" INTEGER,
    "specialNotes" TEXT,
    "clinicSchedule" TEXT,
    "medicationTiming" TEXT,
    "environmentAccommodation" TEXT,
    "communicationAccommodation" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characteristic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "micro_tasks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "siteId" TEXT,
    "taskCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessCategory" TEXT NOT NULL,
    "category" TEXT,
    "requiredSkillTags" TEXT[],
    "difficultyLevel" INTEGER NOT NULL,
    "standardDuration" INTEGER,
    "physicalLoad" TEXT,
    "cognitiveLoad" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "micro_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_assignments" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "microTaskId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_results" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "conductedById" TEXT,
    "d1Score" DOUBLE PRECISION,
    "d2Score" DOUBLE PRECISION,
    "d3Score" DOUBLE PRECISION,
    "d4Score" DOUBLE PRECISION,
    "d5Score" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_answers" (
    "id" TEXT NOT NULL,
    "assessmentResultId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "evaluationType" TEXT NOT NULL DEFAULT 'self',
    "score" INTEGER,
    "isNotApplicable" BOOLEAN NOT NULL DEFAULT false,
    "isStrength" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_scores" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "recordDate" DATE NOT NULL,
    "mood" INTEGER NOT NULL,
    "sleep" INTEGER NOT NULL,
    "condition" INTEGER NOT NULL,
    "medicationTaken" TEXT,
    "note" TEXT,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thanks_notifications" (
    "id" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "memberId" TEXT,
    "thankedAt" TIMESTAMP(3),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thanks_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_userId_key" ON "members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "members_employeeNumber_key" ON "members"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "characteristic_profiles_memberId_key" ON "characteristic_profiles"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "micro_tasks_taskCode_key" ON "micro_tasks"("taskCode");

-- CreateIndex
CREATE INDEX "task_assignments_memberId_assignedDate_idx" ON "task_assignments"("memberId", "assignedDate");

-- CreateIndex
CREATE INDEX "assessment_results_memberId_period_idx" ON "assessment_results"("memberId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_answers_assessmentResultId_questionId_evaluation_key" ON "assessment_answers"("assessmentResultId", "questionId", "evaluationType");

-- CreateIndex
CREATE UNIQUE INDEX "vital_scores_memberId_recordDate_key" ON "vital_scores"("memberId", "recordDate");

-- CreateIndex
CREATE UNIQUE INDEX "thanks_notifications_qrToken_key" ON "thanks_notifications"("qrToken");

-- CreateIndex
CREATE INDEX "thanks_notifications_memberId_thankedAt_idx" ON "thanks_notifications"("memberId", "thankedAt");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characteristic_profiles" ADD CONSTRAINT "characteristic_profiles_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characteristic_profiles" ADD CONSTRAINT "characteristic_profiles_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "micro_tasks" ADD CONSTRAINT "micro_tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "micro_tasks" ADD CONSTRAINT "micro_tasks_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_microTaskId_fkey" FOREIGN KEY ("microTaskId") REFERENCES "micro_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_conductedById_fkey" FOREIGN KEY ("conductedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_assessmentResultId_fkey" FOREIGN KEY ("assessmentResultId") REFERENCES "assessment_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_scores" ADD CONSTRAINT "vital_scores_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanks_notifications" ADD CONSTRAINT "thanks_notifications_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanks_notifications" ADD CONSTRAINT "thanks_notifications_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
