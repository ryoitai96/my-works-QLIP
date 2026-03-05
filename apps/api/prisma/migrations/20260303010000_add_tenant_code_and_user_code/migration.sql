-- AlterTable: Add tenantCode to tenants
ALTER TABLE "tenants" ADD COLUMN "tenantCode" TEXT;

-- Backfill existing tenants with generated codes
UPDATE "tenants" SET "tenantCode" = 'T-' || LPAD(ROW_NUMBER::TEXT, 3, '0')
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") FROM "tenants") AS sub(id, ROW_NUMBER)
WHERE "tenants".id = sub.id;

-- Make tenantCode required and unique
ALTER TABLE "tenants" ALTER COLUMN "tenantCode" SET NOT NULL;
CREATE UNIQUE INDEX "tenants_tenantCode_key" ON "tenants"("tenantCode");

-- AlterTable: Add userCode to users
ALTER TABLE "users" ADD COLUMN "userCode" TEXT;

-- Backfill existing users with generated codes
UPDATE "users" SET "userCode" = 'U-' || LPAD(ROW_NUMBER::TEXT, 3, '0')
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") FROM "users") AS sub(id, ROW_NUMBER)
WHERE "users".id = sub.id;

-- Make userCode required and unique
ALTER TABLE "users" ALTER COLUMN "userCode" SET NOT NULL;
CREATE UNIQUE INDEX "users_userCode_key" ON "users"("userCode");
