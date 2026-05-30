-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "CarModel_isActive_name_idx" ON "CarModel"("isActive", "name");

-- CreateIndex
CREATE INDEX "SaleEntry_soldAt_idx" ON "SaleEntry"("soldAt");
