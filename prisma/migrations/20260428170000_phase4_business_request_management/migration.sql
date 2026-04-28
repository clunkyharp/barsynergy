-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'draft';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN "businessNotes" TEXT;
