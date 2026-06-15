-- CreateEnum
CREATE TYPE "AuthNotificationType" AS ENUM ('user_verify_email', 'user_password_reset', 'business_password_reset');

-- CreateEnum
CREATE TYPE "AuthNotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "AuthNotification" (
    "id" TEXT NOT NULL,
    "type" "AuthNotificationType" NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "payload" JSONB NOT NULL,
    "status" "AuthNotificationStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthNotification_userId_idx" ON "AuthNotification"("userId");

-- CreateIndex
CREATE INDEX "AuthNotification_type_idx" ON "AuthNotification"("type");

-- CreateIndex
CREATE INDEX "AuthNotification_status_nextAttemptAt_idx" ON "AuthNotification"("status", "nextAttemptAt");
