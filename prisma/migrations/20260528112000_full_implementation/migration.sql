-- CreateEnum
CREATE TYPE "MonthlySaleStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncentiveSlab" (
    "id" TEXT NOT NULL,
    "minUnits" INTEGER NOT NULL,
    "maxUnits" INTEGER,
    "perUnitAmount" DECIMAL(10,2) NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncentiveSlab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySale" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "status" "MonthlySaleStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "totalIncentive" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySaleItem" (
    "id" TEXT NOT NULL,
    "monthlyId" TEXT NOT NULL,
    "carModelId" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySale_userId_monthKey_key" ON "MonthlySale"("userId", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySaleItem_monthlyId_carModelId_key" ON "MonthlySaleItem"("monthlyId", "carModelId");

-- AddForeignKey
ALTER TABLE "MonthlySale" ADD CONSTRAINT "MonthlySale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySaleItem" ADD CONSTRAINT "MonthlySaleItem_monthlyId_fkey" FOREIGN KEY ("monthlyId") REFERENCES "MonthlySale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySaleItem" ADD CONSTRAINT "MonthlySaleItem_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
