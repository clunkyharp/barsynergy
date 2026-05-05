-- AlterEnum
ALTER TYPE "CategoryType" ADD VALUE 'service';
ALTER TYPE "CategoryType" ADD VALUE 'general';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "description" TEXT;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "description" TEXT;

-- AlterTable
ALTER TABLE "Article" ADD COLUMN "coverImageAlt" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "coverImageAlt" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "coverImageAlt" TEXT;

-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN "coverImageAlt" TEXT;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN "coverImageAlt" TEXT;

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "coverImageAlt" TEXT;

-- DropIndex
DROP INDEX "Tag_type_idx";

-- CreateTable
CREATE TABLE "GeneralSponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "logoImageId" TEXT,
    "logoImageAlt" TEXT,
    "logoPath" TEXT,
    "coverImageId" TEXT,
    "coverImageAlt" TEXT,
    "coverImagePath" TEXT,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "seasonLabel" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "websiteUrl" TEXT,
    "instagramUrl" TEXT,
    "whatsappUrl" TEXT,
    "telegramUrl" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "representedBrands" TEXT,
    "benefitsForVenues" TEXT,
    "cityId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneralSponsor_slug_key" ON "GeneralSponsor"("slug");

-- CreateIndex
CREATE INDEX "GeneralSponsor_status_publishedAt_idx" ON "GeneralSponsor"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "GeneralSponsor_cityId_status_idx" ON "GeneralSponsor"("cityId", "status");

-- CreateIndex
CREATE INDEX "GeneralSponsor_isFeatured_status_idx" ON "GeneralSponsor"("isFeatured", "status");

-- CreateIndex
CREATE INDEX "GeneralSponsor_priority_idx" ON "GeneralSponsor"("priority");

-- CreateIndex
CREATE INDEX "Tag_type_isActive_sortOrder_idx" ON "Tag"("type", "isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "GeneralSponsor" ADD CONSTRAINT "GeneralSponsor_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralSponsor" ADD CONSTRAINT "GeneralSponsor_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralSponsor" ADD CONSTRAINT "GeneralSponsor_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralSponsor" ADD CONSTRAINT "GeneralSponsor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralSponsor" ADD CONSTRAINT "GeneralSponsor_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SeedData
INSERT INTO "GeneralSponsor" (
    "id",
    "name",
    "slug",
    "status",
    "logoPath",
    "coverImagePath",
    "shortDescription",
    "fullDescription",
    "seasonLabel",
    "priority",
    "isFeatured",
    "instagramUrl",
    "whatsappUrl",
    "contactName",
    "contactPhone",
    "representedBrands",
    "benefitsForVenues",
    "publishedAt",
    "updatedAt"
) VALUES (
    'general-sponsor-hustle-brew',
    'Hustle Brew',
    'hustle-brew',
    'published',
    '/brand/sponsors/hustle-brew-logo.png',
    '/images/generated/hustle-brew-lineup-v1.png',
    'Кофе, какао, концентрированные соки и рабочие поставки для кофеен, баров и HoReCa-команд.',
    'Hustle Brew работает с кофейным и барным направлением: поставляет кофе, какао, концентрированные соки и позиции для ежедневной работы заведения. Команда представляет KOF и Vérle и помогает быстро собрать поставку под бар, кофейню или учебный формат.',
    'Генеральный спонсор сезона',
    1,
    true,
    'https://www.instagram.com/hustle.brew?igsh=cXd3MjhtNnJ2ODk0',
    'https://wa.me/79288667002',
    'Иса / Арсен',
    '8 928 866 70 02 / 8 989 441 95 95',
    E'KOF\nVérle\nHQ\nThe Welder Catherine\nBarry\nHappy Apple',
    E'подобрать кофе, какао и концентраты под меню\nбыстро собрать поставку для бара, кофейни или учебного события\nполучить прямой контакт без длинной цепочки посредников',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
