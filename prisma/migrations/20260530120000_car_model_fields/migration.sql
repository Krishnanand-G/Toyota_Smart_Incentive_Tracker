-- AlterTable
ALTER TABLE "CarModel" ADD COLUMN "modelName" TEXT;
ALTER TABLE "CarModel" ADD COLUMN "baseSuffix" TEXT;
ALTER TABLE "CarModel" ADD COLUMN "variant" TEXT;

-- Backfill existing rows
UPDATE "CarModel" SET "modelName" = "name" WHERE "modelName" IS NULL;

-- Make modelName required
ALTER TABLE "CarModel" ALTER COLUMN "modelName" SET NOT NULL;
