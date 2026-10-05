/*
  Warnings:

  - The values [NOT_APPLICABLE] on the enum `DeliveryStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryStatus_new" AS ENUM ('NOT_SENT', 'PENDING', 'SENT');
ALTER TABLE "public"."attendance_claims" ALTER COLUMN "deliveryStatus" DROP DEFAULT;
ALTER TABLE "attendance_claims" ALTER COLUMN "deliveryStatus" TYPE "DeliveryStatus_new" USING ("deliveryStatus"::text::"DeliveryStatus_new");
ALTER TYPE "DeliveryStatus" RENAME TO "DeliveryStatus_old";
ALTER TYPE "DeliveryStatus_new" RENAME TO "DeliveryStatus";
DROP TYPE "public"."DeliveryStatus_old";
ALTER TABLE "attendance_claims" ALTER COLUMN "deliveryStatus" SET DEFAULT 'NOT_SENT';
COMMIT;

-- AlterTable
ALTER TABLE "attendance_claims" ALTER COLUMN "deliveryStatus" SET DEFAULT 'NOT_SENT';
