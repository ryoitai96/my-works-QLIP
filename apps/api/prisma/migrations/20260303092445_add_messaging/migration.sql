-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_comments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_fromUserId_createdAt_idx" ON "messages"("fromUserId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_toUserId_createdAt_idx" ON "messages"("toUserId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_tenantId_createdAt_idx" ON "messages"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "message_comments_messageId_createdAt_idx" ON "message_comments"("messageId", "createdAt");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_comments" ADD CONSTRAINT "message_comments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_comments" ADD CONSTRAINT "message_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
