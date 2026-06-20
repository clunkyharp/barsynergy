-- CreateTable
CREATE TABLE "HomepageTestimonial" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageHowItWorksStep" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageHowItWorksStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageTestimonial_status_priority_idx" ON "HomepageTestimonial"("status", "priority");

-- CreateIndex
CREATE INDEX "HomepageHowItWorksStep_status_priority_idx" ON "HomepageHowItWorksStep"("status", "priority");
