-- CreateTable
CREATE TABLE "flower_orders" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flowerProductId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" INTEGER NOT NULL,
    "message" TEXT,
    "recipientName" TEXT,
    "recipientAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flower_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flower_orders_orderCode_key" ON "flower_orders"("orderCode");

-- CreateIndex
CREATE INDEX "flower_orders_userId_createdAt_idx" ON "flower_orders"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "flower_orders" ADD CONSTRAINT "flower_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flower_orders" ADD CONSTRAINT "flower_orders_flowerProductId_fkey" FOREIGN KEY ("flowerProductId") REFERENCES "flower_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
