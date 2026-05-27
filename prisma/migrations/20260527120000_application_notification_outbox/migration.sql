-- CreateEnum
CREATE TYPE "ApplicationNotificationChannel" AS ENUM ('admin_email', 'admin_telegram', 'user_email');

-- CreateEnum
CREATE TYPE "ApplicationNotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "ApplicationNotification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "channel" "ApplicationNotificationChannel" NOT NULL,
    "status" "ApplicationNotificationStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationNotification_status_nextAttemptAt_idx" ON "ApplicationNotification"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "ApplicationNotification_applicationId_channel_idx" ON "ApplicationNotification"("applicationId", "channel");

-- AddForeignKey
ALTER TABLE "ApplicationNotification" ADD CONSTRAINT "ApplicationNotification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
