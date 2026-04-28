-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('course_application', 'event_application', 'vacancy_submission', 'vacancy_response', 'supplier_submission', 'partner_application', 'contact_message', 'corporate_training_application', 'certificate_order');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('new', 'in_review', 'contacted', 'forwarded_to_employer', 'payment_pending', 'paid_manually', 'approved', 'rejected', 'completed', 'archived');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "type" "ApplicationType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'new',
    "subject" TEXT,
    "message" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "telegram" TEXT,
    "cityId" TEXT,
    "vacancyId" TEXT,
    "resumeFileId" TEXT,
    "payload" JSONB,
    "consentAcceptedAt" TIMESTAMP(3),
    "consentText" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "forwardedAt" TIMESTAMP(3),
    "forwardedById" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_type_status_idx" ON "Application"("type", "status");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Application_cityId_status_idx" ON "Application"("cityId", "status");

-- CreateIndex
CREATE INDEX "Application_vacancyId_status_idx" ON "Application"("vacancyId", "status");

-- CreateIndex
CREATE INDEX "Application_email_idx" ON "Application"("email");

-- CreateIndex
CREATE INDEX "Application_phone_idx" ON "Application"("phone");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeFileId_fkey" FOREIGN KEY ("resumeFileId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_forwardedById_fkey" FOREIGN KEY ("forwardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
