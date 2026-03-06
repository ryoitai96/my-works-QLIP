-- AlterTable
ALTER TABLE "vital_scores" ADD COLUMN     "appetite" TEXT,
ADD COLUMN     "bedTime" TEXT,
ADD COLUMN     "conditionComment" TEXT,
ADD COLUMN     "medicationNote" TEXT,
ADD COLUMN     "moodComment" TEXT,
ADD COLUMN     "prnMedicationEffect" TEXT,
ADD COLUMN     "prnMedicationUsed" BOOLEAN,
ADD COLUMN     "wakeTime" TEXT;
