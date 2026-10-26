-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('WRONG_URL', 'SCAM', 'INAPPROPRIATE', 'DUPLICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "map_reports" (
    "id" UUID NOT NULL,
    "mapId" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "note" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "map_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "map_reports_mapId_idx" ON "map_reports"("mapId");

-- CreateIndex
CREATE INDEX "map_reports_status_idx" ON "map_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "map_reports_mapId_reporterId_key" ON "map_reports"("mapId", "reporterId");

-- CreateIndex
CREATE INDEX "maps_robloxPlaceId_idx" ON "maps"("robloxPlaceId");

-- AddForeignKey
ALTER TABLE "map_reports" ADD CONSTRAINT "map_reports_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_reports" ADD CONSTRAINT "map_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
