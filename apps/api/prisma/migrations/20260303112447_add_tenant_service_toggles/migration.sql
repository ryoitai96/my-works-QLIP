-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "svc_assessment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "svc_attendance" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "svc_flower_order" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "svc_health_check" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "svc_message" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "svc_micro_task" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "svc_thanks" BOOLEAN NOT NULL DEFAULT true;
