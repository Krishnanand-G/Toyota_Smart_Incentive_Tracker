-- AlterTable
ALTER TABLE "User" ADD COLUMN "officerId" TEXT;
ALTER TABLE "User" ADD COLUMN "photoUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_officerId_key" ON "User"("officerId");
