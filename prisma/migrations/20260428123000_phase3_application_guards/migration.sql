-- CreateTable
CREATE TABLE "ApplicationSubmissionThrottle" (
    "keyHash" TEXT NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationSubmissionThrottle_pkey" PRIMARY KEY ("keyHash")
);

-- CreateIndex
CREATE INDEX "ApplicationSubmissionThrottle_windowStartedAt_idx" ON "ApplicationSubmissionThrottle"("windowStartedAt");

-- CreateIndex
CREATE INDEX "ApplicationSubmissionThrottle_updatedAt_idx" ON "ApplicationSubmissionThrottle"("updatedAt");
