-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MapStatus" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('ROBUX', 'COIN', 'ITEM', 'XP', 'SPIN', 'OTHER');

-- CreateEnum
CREATE TYPE "TrackerStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'SENT');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maps" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creatorName" TEXT NOT NULL,
    "creatorRobloxId" TEXT,
    "robloxPlaceId" TEXT,
    "robloxUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "durationDays" INTEGER NOT NULL,
    "phaseNumber" INTEGER NOT NULL DEFAULT 1,
    "parentMapId" UUID,
    "status" "MapStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "submittedById" UUID,
    "lastVerifiedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_rewards" (
    "id" UUID NOT NULL,
    "mapId" UUID NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "map_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_trackers" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "mapId" UUID NOT NULL,
    "cycleNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttendanceAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "TrackerStatus" NOT NULL DEFAULT 'ACTIVE',
    "resetReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_claims" (
    "id" UUID NOT NULL,
    "trackerId" UUID NOT NULL,
    "rewardId" UUID NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "deliveredAt" TIMESTAMP(3),
    "deliveryNote" TEXT,

    CONSTRAINT "attendance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_change_logs" (
    "id" UUID NOT NULL,
    "mapId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "map_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "maps_slug_key" ON "maps"("slug");

-- CreateIndex
CREATE INDEX "maps_status_idx" ON "maps"("status");

-- CreateIndex
CREATE INDEX "maps_verificationStatus_idx" ON "maps"("verificationStatus");

-- CreateIndex
CREATE INDEX "maps_durationDays_idx" ON "maps"("durationDays");

-- CreateIndex
CREATE INDEX "maps_parentMapId_idx" ON "maps"("parentMapId");

-- CreateIndex
CREATE INDEX "map_rewards_mapId_idx" ON "map_rewards"("mapId");

-- CreateIndex
CREATE UNIQUE INDEX "map_rewards_mapId_dayNumber_key" ON "map_rewards"("mapId", "dayNumber");

-- CreateIndex
CREATE INDEX "attendance_trackers_userId_idx" ON "attendance_trackers"("userId");

-- CreateIndex
CREATE INDEX "attendance_trackers_mapId_idx" ON "attendance_trackers"("mapId");

-- CreateIndex
CREATE INDEX "attendance_trackers_userId_mapId_idx" ON "attendance_trackers"("userId", "mapId");

-- CreateIndex
CREATE INDEX "attendance_trackers_status_idx" ON "attendance_trackers"("status");

-- CreateIndex
CREATE INDEX "attendance_claims_trackerId_idx" ON "attendance_claims"("trackerId");

-- CreateIndex
CREATE INDEX "attendance_claims_rewardId_idx" ON "attendance_claims"("rewardId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_claims_trackerId_rewardId_key" ON "attendance_claims"("trackerId", "rewardId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_claims_trackerId_dayNumber_key" ON "attendance_claims"("trackerId", "dayNumber");

-- CreateIndex
CREATE INDEX "map_change_logs_mapId_idx" ON "map_change_logs"("mapId");

-- CreateIndex
CREATE INDEX "map_change_logs_adminId_idx" ON "map_change_logs"("adminId");

-- AddForeignKey
ALTER TABLE "maps" ADD CONSTRAINT "maps_parentMapId_fkey" FOREIGN KEY ("parentMapId") REFERENCES "maps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maps" ADD CONSTRAINT "maps_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_rewards" ADD CONSTRAINT "map_rewards_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_trackers" ADD CONSTRAINT "attendance_trackers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_trackers" ADD CONSTRAINT "attendance_trackers_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_claims" ADD CONSTRAINT "attendance_claims_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "attendance_trackers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_claims" ADD CONSTRAINT "attendance_claims_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "map_rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_change_logs" ADD CONSTRAINT "map_change_logs_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_change_logs" ADD CONSTRAINT "map_change_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
