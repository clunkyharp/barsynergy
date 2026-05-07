-- CreateTable
CREATE TABLE "HomepageHero" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "signalsText" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageAudienceCard" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "actionLabel" TEXT NOT NULL,
    "proof" TEXT,
    "imagePath" TEXT,
    "iconKey" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageAudienceCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSocialBlock" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "helperText" TEXT,
    "actionLabel" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "logoPath" TEXT,
    "variant" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSocialBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageCtaBlock" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "helperText" TEXT,
    "primaryLabel" TEXT NOT NULL,
    "primaryHref" TEXT NOT NULL,
    "secondaryLabel" TEXT,
    "secondaryHref" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageCtaBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageCalculatorTeaser" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cardEyebrow" TEXT NOT NULL,
    "cardTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stepsText" TEXT,
    "actionLabel" TEXT NOT NULL,
    "actionHref" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageCalculatorTeaser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageHero_status_priority_idx" ON "HomepageHero"("status", "priority");

-- CreateIndex
CREATE INDEX "HomepageAudienceCard_status_priority_idx" ON "HomepageAudienceCard"("status", "priority");

-- CreateIndex
CREATE INDEX "HomepageSocialBlock_status_priority_idx" ON "HomepageSocialBlock"("status", "priority");

-- CreateIndex
CREATE INDEX "HomepageCtaBlock_status_priority_idx" ON "HomepageCtaBlock"("status", "priority");

-- CreateIndex
CREATE INDEX "HomepageCalculatorTeaser_status_priority_idx" ON "HomepageCalculatorTeaser"("status", "priority");

-- SeedData
INSERT INTO "HomepageHero" (
    "id",
    "status",
    "eyebrow",
    "title",
    "description",
    "signalsText",
    "priority",
    "publishedAt",
    "updatedAt"
) VALUES (
    'homepage-hero-default',
    'published',
    'Обучение, события, вакансии',
    'BARSYNERGY',
    'Здесь собраны обучение, события, вакансии, поставщики и партнёрские запросы для барной индустрии СКФО.',
    E'Пилотный запуск | уже открыты заявки, вакансии и каталог\nАфиша сезона | добавляем события по городам СКФО\nКаталог в работе | проверяем поставщиков и партнёров вручную\nЗаявки через команду | обучение, вакансии и запросы для заведений проверяются перед публикацией',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "HomepageAudienceCard" (
    "id",
    "status",
    "title",
    "description",
    "href",
    "actionLabel",
    "proof",
    "imagePath",
    "iconKey",
    "priority",
    "publishedAt",
    "updatedAt"
) VALUES
    (
        'homepage-audience-specialists',
        'published',
        'Для специалиста',
        'Курсы, события, материалы и вакансии по региону.',
        '/education',
        'Начать с обучения',
        'курсы, афиша, вакансии',
        '/images/home/audience-specialists-coffee.jpg',
        'users',
        10,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'homepage-audience-venues',
        'published',
        'Для заведения',
        'Разместить вакансию, найти поставщика или собрать обучение для команды.',
        '/vacancies',
        'Отправить заявку',
        'найм, закупки, команда',
        '/images/home/audience-venues-coffee-bar.jpg',
        'store',
        20,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'homepage-audience-brands',
        'published',
        'Для бренда или поставщика',
        'Попасть в каталог, обсудить событие или партнёрский формат.',
        '/partners',
        'Смотреть форматы',
        'каталог, партнёрство, спонсорство',
        '/images/home/audience-brands-coffee.jpg',
        'star',
        30,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

INSERT INTO "HomepageSocialBlock" (
    "id",
    "status",
    "name",
    "title",
    "description",
    "helperText",
    "actionLabel",
    "href",
    "logoPath",
    "variant",
    "priority",
    "publishedAt",
    "updatedAt"
) VALUES
    (
        'homepage-social-telegram',
        'published',
        'Telegram',
        'Telegram',
        'Даты курсов, наборы, материалы и новости проекта.',
        'анонсы',
        'Перейти в Telegram',
        'https://t.me/barsynergy',
        '/images/social/telegram-logo.png',
        'telegram',
        10,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'homepage-social-whatsapp',
        'published',
        'WhatsApp',
        'WhatsApp',
        'Пишите по программам, заявкам и участию.',
        'чат',
        'Перейти в WhatsApp',
        'https://chat.whatsapp.com/GlAY6QDLeAt4jeKsAFkgu4?mode=gi_t',
        '/images/social/whatsapp-logo.png',
        'whatsapp',
        20,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'homepage-social-instagram',
        'published',
        'Instagram',
        'Instagram',
        'Фото, анонсы и короткие заметки о событиях.',
        'фото и новости',
        'Перейти в Instagram',
        'https://www.instagram.com/bar.synergy?igsh=MXE3b2hjYjE2MGplcQ==',
        '/images/social/instagram-logo.png',
        'instagram',
        30,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

INSERT INTO "HomepageCtaBlock" (
    "id",
    "status",
    "title",
    "description",
    "helperText",
    "primaryLabel",
    "primaryHref",
    "secondaryLabel",
    "secondaryHref",
    "priority",
    "publishedAt",
    "updatedAt"
) VALUES (
    'homepage-cta-default',
    'published',
    'Связаться с командой BARSYNERGY',
    'Напишите, если хотите предложить событие, обучение, вакансию, поставщика или партнёрство.',
    'Для новых заявок',
    'Написать команде',
    '/contacts',
    'О проекте',
    '/about',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "HomepageCalculatorTeaser" (
    "id",
    "status",
    "eyebrow",
    "title",
    "cardEyebrow",
    "cardTitle",
    "description",
    "stepsText",
    "actionLabel",
    "actionHref",
    "priority",
    "publishedAt",
    "updatedAt"
) VALUES (
    'homepage-calculator-teaser-default',
    'published',
    'Инструменты',
    'Калькулятор себестоимости',
    'Практический инструмент',
    'Для меню и рабочих расчётов бара',
    'Рассчитайте себестоимость напитка или позиции меню без регистрации и сохранения данных.',
    E'Добавьте ингредиенты и цену упаковки\nУкажите количество для одной порции\nПолучите себестоимость и ориентир по цене',
    'Открыть калькулятор',
    '/tools/cost-calculator',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
