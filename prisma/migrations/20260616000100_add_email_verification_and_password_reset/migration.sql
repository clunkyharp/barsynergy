-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserEmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailVerificationToken_tokenHash_key" ON "UserEmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "UserEmailVerificationToken_userId_idx" ON "UserEmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "UserEmailVerificationToken_expiresAt_idx" ON "UserEmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "UserEmailVerificationToken_usedAt_idx" ON "UserEmailVerificationToken"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPasswordResetToken_tokenHash_key" ON "UserPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "UserPasswordResetToken_userId_idx" ON "UserPasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "UserPasswordResetToken_expiresAt_idx" ON "UserPasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "UserPasswordResetToken_usedAt_idx" ON "UserPasswordResetToken"("usedAt");

-- AddForeignKey
ALTER TABLE "UserEmailVerificationToken" ADD CONSTRAINT "UserEmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPasswordResetToken" ADD CONSTRAINT "UserPasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
