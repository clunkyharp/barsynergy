-- CreateEnum
CREATE TYPE "JobSearchStatus" AS ENUM ('active', 'open', 'not_looking');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'freelance', 'remote');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "avatarFileId" TEXT,
ADD COLUMN     "desiredSalary" INTEGER,
ADD COLUMN     "desiredSalaryMax" INTEGER,
ADD COLUMN     "employmentTypes" "EmploymentType"[],
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobSearchStatus" "JobSearchStatus",
ADD COLUMN     "skills" TEXT[];

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileSkill" (
    "profileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileSkill_pkey" PRIMARY KEY ("profileId","skillId")
);

-- CreateTable
CREATE TABLE "SavedVacancy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedVacancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkExperience_profileId_sortOrder_idx" ON "WorkExperience"("profileId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_isActive_sortOrder_idx" ON "Skill"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ProfileSkill_skillId_idx" ON "ProfileSkill"("skillId");

-- CreateIndex
CREATE INDEX "SavedVacancy_userId_idx" ON "SavedVacancy"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedVacancy_userId_vacancyId_key" ON "SavedVacancy"("userId", "vacancyId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_avatarFileId_key" ON "Profile"("avatarFileId");

-- CreateIndex
CREATE INDEX "Profile_isPublic_jobSearchStatus_idx" ON "Profile"("isPublic", "jobSearchStatus");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_avatarFileId_fkey" FOREIGN KEY ("avatarFileId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSkill" ADD CONSTRAINT "ProfileSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSkill" ADD CONSTRAINT "ProfileSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedVacancy" ADD CONSTRAINT "SavedVacancy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedVacancy" ADD CONSTRAINT "SavedVacancy_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
