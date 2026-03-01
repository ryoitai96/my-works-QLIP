/*
  Warnings:

  - You are about to drop the `thanks_notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "thanks_notifications" DROP CONSTRAINT "thanks_notifications_memberId_fkey";

-- DropForeignKey
ALTER TABLE "thanks_notifications" DROP CONSTRAINT "thanks_notifications_siteId_fkey";

-- DropTable
DROP TABLE "thanks_notifications";

-- CreateTable
CREATE TABLE "thanks_cards" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thanks_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "thanks_cards_toUserId_createdAt_idx" ON "thanks_cards"("toUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "thanks_cards" ADD CONSTRAINT "thanks_cards_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanks_cards" ADD CONSTRAINT "thanks_cards_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
