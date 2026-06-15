-- AlterEnum: add resume_invitation to ApplicationType
ALTER TYPE "ApplicationType" ADD VALUE 'resume_invitation';

-- AlterEnum: add specialists to NotificationTopic
ALTER TYPE "NotificationTopic" ADD VALUE 'specialists';

-- AlterTable: Profile add publicHandle, headline, publishedAt
ALTER TABLE "Profile" ADD COLUMN "publicHandle" TEXT;
ALTER TABLE "Profile" ADD COLUMN "headline" TEXT;
ALTER TABLE "Profile" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateIndex: unique on publicHandle
CREATE UNIQUE INDEX "Profile_publicHandle_key" ON public."Profile"("publicHandle");

-- DropIndex: old composite, recreate with publishedAt
DROP INDEX IF EXISTS "Profile_isPublic_jobSearchStatus_idx";
CREATE INDEX "Profile_isPublic_jobSearchStatus_publishedAt_idx" ON public."Profile"("isPublic", "jobSearchStatus", "publishedAt");

-- AlterTable: Application add profileId
ALTER TABLE "Application" ADD COLUMN "profileId" TEXT;

-- CreateIndex: Application profileId
CREATE INDEX "Application_profileId_status_idx" ON public."Application"("profileId", "status");

-- AddForeignKey: Application.profileId -> Profile.id
ALTER TABLE "Application" ADD CONSTRAINT "Application_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"(id) ON DELETE SET NULL ON UPDATE CASCADE;
