-- AlterTable
ALTER TABLE "Application" ADD COLUMN "supplierId" TEXT,
ADD COLUMN "partnerId" TEXT;

-- CreateIndex
CREATE INDEX "Application_supplierId_status_idx" ON "Application"("supplierId", "status");

-- CreateIndex
CREATE INDEX "Application_partnerId_status_idx" ON "Application"("partnerId", "status");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
