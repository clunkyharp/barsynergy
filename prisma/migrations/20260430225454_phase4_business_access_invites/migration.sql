-- CreateTable
CREATE TABLE "BusinessAccessInvite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessAccessInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccessInvite_tokenHash_key" ON "BusinessAccessInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "BusinessAccessInvite_userId_idx" ON "BusinessAccessInvite"("userId");

-- CreateIndex
CREATE INDEX "BusinessAccessInvite_applicationId_idx" ON "BusinessAccessInvite"("applicationId");

-- CreateIndex
CREATE INDEX "BusinessAccessInvite_expiresAt_idx" ON "BusinessAccessInvite"("expiresAt");

-- CreateIndex
CREATE INDEX "BusinessAccessInvite_usedAt_idx" ON "BusinessAccessInvite"("usedAt");

-- AddForeignKey
ALTER TABLE "BusinessAccessInvite" ADD CONSTRAINT "BusinessAccessInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAccessInvite" ADD CONSTRAINT "BusinessAccessInvite_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
