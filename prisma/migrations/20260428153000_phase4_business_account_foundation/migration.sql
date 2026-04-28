-- CreateEnum
CREATE TYPE "BusinessAccountStatus" AS ENUM ('pending', 'active', 'blocked', 'archived');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'business';

-- AlterEnum
ALTER TYPE "ApplicationType" ADD VALUE 'business_account_request';

-- CreateTable
CREATE TABLE "BusinessAccount" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "BusinessAccountStatus" NOT NULL DEFAULT 'pending',
    "cityId" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "telegram" TEXT,
    "websiteUrl" TEXT,
    "description" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessAccount_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Application" ADD COLUMN "businessAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccount_ownerId_key" ON "BusinessAccount"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccount_slug_key" ON "BusinessAccount"("slug");

-- CreateIndex
CREATE INDEX "BusinessAccount_status_createdAt_idx" ON "BusinessAccount"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BusinessAccount_cityId_status_idx" ON "BusinessAccount"("cityId", "status");

-- CreateIndex
CREATE INDEX "BusinessAccount_companyName_idx" ON "BusinessAccount"("companyName");

-- CreateIndex
CREATE INDEX "Application_businessAccountId_status_idx" ON "Application"("businessAccountId", "status");

-- AddForeignKey
ALTER TABLE "BusinessAccount" ADD CONSTRAINT "BusinessAccount_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAccount" ADD CONSTRAINT "BusinessAccount_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
