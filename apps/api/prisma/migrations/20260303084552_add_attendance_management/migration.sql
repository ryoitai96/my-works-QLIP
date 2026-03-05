-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "recordDate" DATE NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'not_clocked_in',
    "workMinutes" INTEGER,
    "breakMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_breaks" (
    "id" TEXT NOT NULL,
    "attendanceRecordId" TEXT NOT NULL,
    "breakStart" TIMESTAMP(3) NOT NULL,
    "breakEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_breaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_correction_requests" (
    "id" TEXT NOT NULL,
    "attendanceRecordId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "correctionType" TEXT NOT NULL,
    "requestedValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedByUserId" TEXT,
    "reviewComment" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_work_schedules" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "breakMinutes" INTEGER NOT NULL DEFAULT 60,
    "workDaysPerWeek" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_records_memberId_recordDate_idx" ON "attendance_records"("memberId", "recordDate");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_memberId_recordDate_key" ON "attendance_records"("memberId", "recordDate");

-- CreateIndex
CREATE INDEX "attendance_correction_requests_requestedByUserId_status_idx" ON "attendance_correction_requests"("requestedByUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "member_work_schedules_memberId_key" ON "member_work_schedules"("memberId");

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_breaks" ADD CONSTRAINT "attendance_breaks_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_work_schedules" ADD CONSTRAINT "member_work_schedules_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
