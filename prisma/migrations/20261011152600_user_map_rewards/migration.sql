/*
  Warnings:

  - Added the required column `rewardTitle` to the `attendance_claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardType` to the `attendance_claims` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendance_claims" DROP CONSTRAINT "attendance_claims_rewardId_fkey";

-- AlterTable
ALTER TABLE "attendance_claims" ADD COLUMN     "rewardAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rewardDescription" TEXT,
ADD COLUMN     "rewardTitle" TEXT NOT NULL,
ADD COLUMN     "rewardType" "RewardType" NOT NULL,
ALTER COLUMN "rewardId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_map_rewards" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "mapId" UUID NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "rewardType" "RewardType" NOT NULL DEFAULT 'ROBUX',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_map_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_map_rewards_userId_mapId_idx" ON "user_map_rewards"("userId", "mapId");

-- CreateIndex
CREATE UNIQUE INDEX "user_map_rewards_userId_mapId_dayNumber_key" ON "user_map_rewards"("userId", "mapId", "dayNumber");

-- AddForeignKey
ALTER TABLE "user_map_rewards" ADD CONSTRAINT "user_map_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_map_rewards" ADD CONSTRAINT "user_map_rewards_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_claims" ADD CONSTRAINT "attendance_claims_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "map_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
