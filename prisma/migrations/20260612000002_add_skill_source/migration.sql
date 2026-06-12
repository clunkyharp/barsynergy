-- CreateEnum
CREATE TYPE "SkillSource" AS ENUM ('admin', 'user_generated');

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN "source" "SkillSource" NOT NULL DEFAULT 'admin';

-- CreateIndex
CREATE INDEX "Skill_source_createdAt_idx" ON "Skill"("source", "createdAt");
