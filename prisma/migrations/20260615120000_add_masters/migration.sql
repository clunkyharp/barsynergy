-- CreateEnum
CREATE TYPE "MasterEntityType" AS ENUM ('individual', 'business');

-- AlterEnum
ALTER TYPE "CategoryType" ADD VALUE 'master';

-- AlterEnum
ALTER TYPE "ApplicationType" ADD VALUE 'master_inquiry';
ALTER TYPE "ApplicationType" ADD VALUE 'master_submission';

-- AlterEnum
ALTER TYPE "NotificationTopic" ADD VALUE 'masters';

-- CreateTable
CREATE TABLE "Master" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "coverImageId" TEXT,
    "coverImageAlt" TEXT,
    "cityId" TEXT,
    "categoryId" TEXT,
    "businessAccountId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "entityType" "MasterEntityType" NOT NULL DEFAULT 'individual',
    "fullName" TEXT,
    "companyName" TEXT,
    "description" TEXT NOT NULL,
    "contactLabel" TEXT,
    "contactTelegram" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "specializations" TEXT[],
    "experienceYears" INTEGER,
    "rateLabel" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "serviceArea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Master_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Application" ADD COLUMN "masterId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Master_slug_key" ON "Master"("slug");

-- CreateIndex
CREATE INDEX "Master_status_publishedAt_idx" ON "Master"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Master_cityId_status_idx" ON "Master"("cityId", "status");

-- CreateIndex
CREATE INDEX "Master_categoryId_status_idx" ON "Master"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Master_businessAccountId_idx" ON "Master"("businessAccountId");

-- CreateIndex
CREATE INDEX "Master_isVerified_status_idx" ON "Master"("isVerified", "status");

-- CreateIndex
CREATE INDEX "Master_sortOrder_idx" ON "Master"("sortOrder");

-- CreateIndex
CREATE INDEX "Application_masterId_status_idx" ON "Application"("masterId", "status");

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Master" ADD CONSTRAINT "Master_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
