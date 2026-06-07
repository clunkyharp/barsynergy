-- Create ConversationSender enum
CREATE TYPE "ConversationSender" AS ENUM ('user', 'business', 'admin');

-- Add SUPPLIER_INQUIRY to ApplicationType
ALTER TYPE "ApplicationType" ADD VALUE 'supplier_inquiry';

-- Add message notification channels
ALTER TYPE "ApplicationNotificationChannel" ADD VALUE 'business_message_email';
ALTER TYPE "ApplicationNotificationChannel" ADD VALUE 'user_message_email';

-- Add conversation tracking fields to Application
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "hasUnreadForUser" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "hasUnreadForBusiness" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "lastMessageAt" TIMESTAMP(3);

-- Create ConversationMessage table
CREATE TABLE "ConversationMessage" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "authorId" TEXT,
  "senderRole" "ConversationSender" NOT NULL,
  "body" TEXT NOT NULL,
  "isReadByUser" BOOLEAN NOT NULL DEFAULT false,
  "isReadByBusiness" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- ConversationMessage indexes
CREATE INDEX "ConversationMessage_applicationId_createdAt_idx" ON "ConversationMessage"("applicationId", "createdAt");
CREATE INDEX "ConversationMessage_authorId_idx" ON "ConversationMessage"("authorId");
CREATE INDEX "ConversationMessage_applicationId_isReadByUser_idx" ON "ConversationMessage"("applicationId", "isReadByUser");
CREATE INDEX "ConversationMessage_applicationId_isReadByBusiness_idx" ON "ConversationMessage"("applicationId", "isReadByBusiness");

-- ConversationMessage foreign keys
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
