-- CreateEnum
CREATE TYPE "ResetMode" AS ENUM ('DAILY_UTC', 'DAILY_LOCAL', 'ROLLING_24H');

-- AlterTable
ALTER TABLE "attendance_logs" ADD COLUMN     "isBackfilled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "maps" ADD COLUMN     "resetMode" "ResetMode" NOT NULL DEFAULT 'DAILY_LOCAL';
