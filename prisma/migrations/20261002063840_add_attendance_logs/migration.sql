-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" UUID NOT NULL,
    "trackerId" UUID NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_logs_trackerId_idx" ON "attendance_logs"("trackerId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_logs_trackerId_dayNumber_key" ON "attendance_logs"("trackerId", "dayNumber");

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "attendance_trackers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
