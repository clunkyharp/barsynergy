-- CreateTable
CREATE TABLE "AuthAttemptThrottle" (
    "keyHash" TEXT NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthAttemptThrottle_pkey" PRIMARY KEY ("keyHash")
);

-- CreateIndex
CREATE INDEX "AuthAttemptThrottle_windowStartedAt_idx" ON "AuthAttemptThrottle"("windowStartedAt");

-- CreateIndex
CREATE INDEX "AuthAttemptThrottle_updatedAt_idx" ON "AuthAttemptThrottle"("updatedAt");
