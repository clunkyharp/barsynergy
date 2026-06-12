-- CreateEnum
CREATE TYPE "NotificationTopic" AS ENUM ('events', 'articles', 'vacancies', 'courses', 'suppliers');

-- CreateEnum
CREATE TYPE "ContentNotificationOutboxStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "WebPushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" "NotificationTopic" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentNotificationOutbox" (
    "id" TEXT NOT NULL,
    "topic" "NotificationTopic" NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentSlug" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "ContentNotificationOutboxStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentNotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebPushSubscription_userId_endpoint_key" ON "WebPushSubscription"("userId", "endpoint");

-- CreateIndex
CREATE INDEX "WebPushSubscription_userId_idx" ON "WebPushSubscription"("userId");

-- CreateIndex
CREATE INDEX "WebPushSubscription_disabledAt_idx" ON "WebPushSubscription"("disabledAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationPreference_userId_topic_key" ON "UserNotificationPreference"("userId", "topic");

-- CreateIndex
CREATE INDEX "UserNotificationPreference_userId_idx" ON "UserNotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "ContentNotificationOutbox_status_nextAttemptAt_idx" ON "ContentNotificationOutbox"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "ContentNotificationOutbox_topic_idx" ON "ContentNotificationOutbox"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "ContentNotificationOutbox_contentType_contentId_topic_key" ON "ContentNotificationOutbox"("contentType", "contentId", "topic");

-- CreateIndex
CREATE INDEX "ContentNotificationOutbox_contentType_contentId_idx" ON "ContentNotificationOutbox"("contentType", "contentId");

-- AddForeignKey
ALTER TABLE "WebPushSubscription" ADD CONSTRAINT "WebPushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
