-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordStoredAt" TIMESTAMP(3);

-- Clear demo backfill values that were never set through the admin portal
UPDATE "User" SET "passwordPlain" = NULL WHERE "passwordStoredAt" IS NULL;
