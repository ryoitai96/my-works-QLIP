-- DropForeignKey
ALTER TABLE "thanks_cards" DROP CONSTRAINT "thanks_cards_fromUserId_fkey";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "svc_sos" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "thanks_cards" ADD COLUMN     "isQrThanks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qrTokenId" TEXT,
ADD COLUMN     "senderDisplayName" TEXT,
ALTER COLUMN "fromUserId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "gift_qr_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberDisplayName" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "storyText" TEXT NOT NULL,
    "flowerOrderId" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_qr_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sos_reports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reporterUserId" TEXT,
    "siteId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolvedById" TEXT,
    "resolutionNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sos_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_qr_tokens_token_key" ON "gift_qr_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "gift_qr_tokens_flowerOrderId_key" ON "gift_qr_tokens"("flowerOrderId");

-- CreateIndex
CREATE INDEX "gift_qr_tokens_token_idx" ON "gift_qr_tokens"("token");

-- CreateIndex
CREATE INDEX "sos_reports_tenantId_createdAt_idx" ON "sos_reports"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "sos_reports_siteId_createdAt_idx" ON "sos_reports"("siteId", "createdAt");

-- AddForeignKey
ALTER TABLE "thanks_cards" ADD CONSTRAINT "thanks_cards_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanks_cards" ADD CONSTRAINT "thanks_cards_qrTokenId_fkey" FOREIGN KEY ("qrTokenId") REFERENCES "gift_qr_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_qr_tokens" ADD CONSTRAINT "gift_qr_tokens_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_qr_tokens" ADD CONSTRAINT "gift_qr_tokens_flowerOrderId_fkey" FOREIGN KEY ("flowerOrderId") REFERENCES "flower_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_reports" ADD CONSTRAINT "sos_reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_reports" ADD CONSTRAINT "sos_reports_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_reports" ADD CONSTRAINT "sos_reports_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_reports" ADD CONSTRAINT "sos_reports_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
