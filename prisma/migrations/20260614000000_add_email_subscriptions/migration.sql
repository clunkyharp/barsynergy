-- CreateTable
CREATE TABLE "EmailSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "topics" "NotificationTopic"[] NOT NULL,
    "confirmTokenHash" TEXT NOT NULL,
    "unsubTokenHash" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "consentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSubscription_email_key" ON "EmailSubscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSubscription_confirmTokenHash_key" ON "EmailSubscription"("confirmTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSubscription_unsubTokenHash_key" ON "EmailSubscription"("unsubTokenHash");

-- CreateIndex
CREATE INDEX "EmailSubscription_userId_idx" ON "EmailSubscription"("userId");

-- CreateIndex
CREATE INDEX "EmailSubscription_confirmedAt_idx" ON "EmailSubscription"("confirmedAt");

-- CreateIndex
CREATE INDEX "EmailSubscription_unsubscribedAt_idx" ON "EmailSubscription"("unsubscribedAt");

-- AddForeignKey
ALTER TABLE "EmailSubscription" ADD CONSTRAINT "EmailSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
