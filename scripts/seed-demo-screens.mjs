import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import {
  ApplicationStatus,
  ApplicationType,
  BusinessAccountStatus,
  CategoryType,
  ContentStatus,
  PrismaClient,
  UserRole,
  UserStatus
} from '@prisma/client';
import { getDemoSeedConfig } from './demo-seed-guard.mjs';

const prisma = new PrismaClient();

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function upsertCity({ name, slug, region, sortOrder }) {
  return prisma.city.upsert({
    where: { slug },
    update: { name, region, sortOrder, isActive: true },
    create: { name, slug, region, sortOrder, isActive: true }
  });
}

async function upsertCategory({ name, slug, type, sortOrder }) {
  return prisma.category.upsert({
    where: { slug_type: { slug, type } },
    update: { name, sortOrder, isActive: true },
    create: { name, slug, type, sortOrder, isActive: true }
  });
}

async function upsertTag({ name, slug, type, sortOrder }) {
  return prisma.tag.upsert({
    where: { slug_type: { slug, type } },
    update: { name, sortOrder, isActive: true },
    create: { name, slug, type, sortOrder, isActive: true }
  });
}

function articleTagLinks(tags) {
  return tags.map((tag) => ({ tagId: tag.id }));
}

async function main() {
  const { demoBusinessPassword } = getDemoSeedConfig();
  const passwordHash = await bcrypt.hash(demoBusinessPassword, 10);

  await prisma.city.updateMany({
    where: { slug: { in: ['stavropol', 'pyatigorsk', 'nalchik'] } },
    data: { isActive: false }
  });

  const [makhachkala, kaspiysk, derbent, barsCategory, coffeeCategory, ingredientCategory, equipmentCategory] = await Promise.all([
    upsertCity({ name: 'Махачкала', slug: 'makhachkala', region: 'Республика Дагестан', sortOrder: 1 }),
    upsertCity({ name: 'Каспийск', slug: 'kaspiysk', region: 'Республика Дагестан', sortOrder: 2 }),
    upsertCity({ name: 'Дербент', slug: 'derbent', region: 'Республика Дагестан', sortOrder: 3 }),
    upsertCategory({ name: 'Бары', slug: 'bars', type: CategoryType.VACANCY, sortOrder: 1 }),
    upsertCategory({ name: 'Кофейни', slug: 'coffee-shops', type: CategoryType.VACANCY, sortOrder: 2 }),
    upsertCategory({ name: 'Ингредиенты', slug: 'ingredients', type: CategoryType.SUPPLIER, sortOrder: 1 }),
    upsertCategory({ name: 'Оборудование', slug: 'equipment', type: CategoryType.SUPPLIER, sortOrder: 2 })
  ]);

  const demoBusinessUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo-business-atelier@barsynergy.local' },
      update: {
        passwordHash,
        role: UserRole.BUSINESS,
        status: UserStatus.PENDING
      },
      create: {
        email: 'demo-business-atelier@barsynergy.local',
        passwordHash,
        role: UserRole.BUSINESS,
        status: UserStatus.PENDING
      }
    }),
    prisma.user.upsert({
      where: { email: 'demo-business-linea@barsynergy.local' },
      update: {
        passwordHash,
        role: UserRole.BUSINESS,
        status: UserStatus.PENDING
      },
      create: {
        email: 'demo-business-linea@barsynergy.local',
        passwordHash,
        role: UserRole.BUSINESS,
        status: UserStatus.PENDING
      }
    })
  ]);

  const [atelierUser, lineaUser] = demoBusinessUsers;

  const [atelierBusiness, lineaBusiness] = await Promise.all([
    prisma.businessAccount.upsert({
      where: { slug: 'atelier-12-demo' },
      update: {
        ownerId: atelierUser.id,
        companyName: 'Atelier 12',
        status: BusinessAccountStatus.PENDING,
        cityId: makhachkala.id,
        contactPerson: 'Мария Соколова',
        phone: '+7 962 401-12-12',
        telegram: '@atelier12_team',
        websiteUrl: 'https://atelier12.example',
        description: 'Новый городской бар с вечерним сервисом и гастрономическим меню.'
      },
      create: {
        ownerId: atelierUser.id,
        slug: 'atelier-12-demo',
        companyName: 'Atelier 12',
        status: BusinessAccountStatus.PENDING,
        cityId: makhachkala.id,
        contactPerson: 'Мария Соколова',
        phone: '+7 962 401-12-12',
        telegram: '@atelier12_team',
        websiteUrl: 'https://atelier12.example',
        description: 'Новый городской бар с вечерним сервисом и гастрономическим меню.'
      }
    }),
    prisma.businessAccount.upsert({
      where: { slug: 'linea-service-demo' },
      update: {
        ownerId: lineaUser.id,
        companyName: 'Linea Service',
        status: BusinessAccountStatus.PENDING,
        cityId: kaspiysk.id,
        contactPerson: 'Руслан Алиев',
        phone: '+7 928 145-45-10',
        telegram: '@linea_service',
        websiteUrl: 'https://linea-service.example',
        description: 'Оснащение и сервисное сопровождение кофейных и барных проектов.'
      },
      create: {
        ownerId: lineaUser.id,
        slug: 'linea-service-demo',
        companyName: 'Linea Service',
        status: BusinessAccountStatus.PENDING,
        cityId: kaspiysk.id,
        contactPerson: 'Руслан Алиев',
        phone: '+7 928 145-45-10',
        telegram: '@linea_service',
        websiteUrl: 'https://linea-service.example',
        description: 'Оснащение и сервисное сопровождение кофейных и барных проектов.'
      }
    })
  ]);

  const [menuArticleCategory, teamArticleCategory, supplierArticleCategory, eventArticleCategory, regionArticleCategory] = await Promise.all([
    upsertCategory({ name: 'Меню', slug: 'menu', type: CategoryType.ARTICLE, sortOrder: 1 }),
    upsertCategory({ name: 'Команда', slug: 'team', type: CategoryType.ARTICLE, sortOrder: 2 }),
    upsertCategory({ name: 'Поставщики', slug: 'suppliers', type: CategoryType.ARTICLE, sortOrder: 3 }),
    upsertCategory({ name: 'События', slug: 'events', type: CategoryType.ARTICLE, sortOrder: 4 }),
    upsertCategory({ name: 'Индустрия региона', slug: 'regional-industry', type: CategoryType.ARTICLE, sortOrder: 5 })
  ]);

  const [calculatorTag, hiringTag, supplierTag, eventTag, regionTag] = await Promise.all([
    upsertTag({ name: 'Калькулятор', slug: 'calculator', type: CategoryType.ARTICLE, sortOrder: 1 }),
    upsertTag({ name: 'Найм', slug: 'hiring', type: CategoryType.ARTICLE, sortOrder: 2 }),
    upsertTag({ name: 'Поставщики', slug: 'supplier-list', type: CategoryType.ARTICLE, sortOrder: 3 }),
    upsertTag({ name: 'Гостевая смена', slug: 'guest-shift', type: CategoryType.ARTICLE, sortOrder: 4 }),
    upsertTag({ name: 'СКФО', slug: 'skfo', type: CategoryType.ARTICLE, sortOrder: 5 })
  ]);

  const starterArticles = await Promise.all([
    prisma.article.upsert({
      where: { slug: 'how-to-calculate-drink-cost' },
      update: {
        title: 'Как считать себестоимость напитка',
        summary: 'Короткий порядок расчёта: цена упаковки, расход на порцию, итоговая себестоимость и рабочая цена продажи.',
        body: [
          'Начните с одной позиции меню. Запишите все ингредиенты, которые входят в порцию: кофе, молоко, сироп, украшение, лёд или расходники, если они заметно влияют на итог.',
          'Для каждого ингредиента укажите цену упаковки и её размер. Затем внесите расход на одну порцию. Важно сравнивать одинаковые единицы: граммы с граммами, миллилитры с миллилитрами.',
          'Себестоимость строки считается так: цена упаковки делится на размер упаковки и умножается на расход в рецепте. Итог по напитку — сумма всех строк.',
          'После этого задайте целевую долю себестоимости. Для быстрой проверки можно начать с 30%, а затем сравнить цену с рынком, подачей и ожиданиями гостей.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(1),
        archivedAt: null,
        categoryId: menuArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 1,
        tags: { deleteMany: {}, create: articleTagLinks([calculatorTag]) }
      },
      create: {
        slug: 'how-to-calculate-drink-cost',
        title: 'Как считать себестоимость напитка',
        summary: 'Короткий порядок расчёта: цена упаковки, расход на порцию, итоговая себестоимость и рабочая цена продажи.',
        body: [
          'Начните с одной позиции меню. Запишите все ингредиенты, которые входят в порцию: кофе, молоко, сироп, украшение, лёд или расходники, если они заметно влияют на итог.',
          'Для каждого ингредиента укажите цену упаковки и её размер. Затем внесите расход на одну порцию. Важно сравнивать одинаковые единицы: граммы с граммами, миллилитры с миллилитрами.',
          'Себестоимость строки считается так: цена упаковки делится на размер упаковки и умножается на расход в рецепте. Итог по напитку — сумма всех строк.',
          'После этого задайте целевую долю себестоимости. Для быстрой проверки можно начать с 30%, а затем сравнить цену с рынком, подачей и ожиданиями гостей.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(1),
        categoryId: menuArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 1,
        tags: { create: articleTagLinks([calculatorTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'what-to-include-in-vacancy' },
      update: {
        title: 'Что указать в вакансии',
        summary: 'Проверьте роль, график, оплату, требования и контакт до публикации вакансии.',
        body: [
          'Хорошая вакансия начинается с понятной роли. Напишите, кого ищете: бариста, бармена, менеджера смены, управляющего или стажёра.',
          'Дальше укажите график, город, район, формат занятости и оплату. Если сумма зависит от смен, процентов или собеседования, лучше написать это прямо.',
          'Отдельно перечислите задачи: работа с гостем, касса, настройка напитков, инвентаризация, обучение смены или запуск меню. Так кандидат быстрее поймёт, подходит ли ему позиция.',
          'В конце добавьте контакт и короткий порядок отклика: куда писать, что прислать и когда ждать ответа.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        archivedAt: null,
        categoryId: teamArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 2,
        tags: { deleteMany: {}, create: articleTagLinks([hiringTag]) }
      },
      create: {
        slug: 'what-to-include-in-vacancy',
        title: 'Что указать в вакансии',
        summary: 'Проверьте роль, график, оплату, требования и контакт до публикации вакансии.',
        body: [
          'Хорошая вакансия начинается с понятной роли. Напишите, кого ищете: бариста, бармена, менеджера смены, управляющего или стажёра.',
          'Дальше укажите график, город, район, формат занятости и оплату. Если сумма зависит от смен, процентов или собеседования, лучше написать это прямо.',
          'Отдельно перечислите задачи: работа с гостем, касса, настройка напитков, инвентаризация, обучение смены или запуск меню. Так кандидат быстрее поймёт, подходит ли ему позиция.',
          'В конце добавьте контакт и короткий порядок отклика: куда писать, что прислать и когда ждать ответа.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        categoryId: teamArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 2,
        tags: { create: articleTagLinks([hiringTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'how-to-choose-supplier' },
      update: {
        title: 'Как выбрать поставщика',
        summary: 'Соберите список рабочих контактов и сравните категорию, географию, условия и стабильность поставки.',
        body: [
          'Сначала определите, что именно нужно заведению: кофе, молоко, сиропы, оборудование, стекло, расходники или сервисное обслуживание.',
          'Проверьте географию работы. Поставщик может быть удобным по ассортименту, но неудобным по срокам доставки, минимальному заказу или маршруту.',
          'Сравните условия: цена, отсрочка, частота поставок, наличие документов, возможность срочной дозакупки и контакт ответственного менеджера.',
          'Для первой закупки лучше зафиксировать короткий тест: одна категория, понятный объём и дата обратной связи от команды.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        archivedAt: null,
        categoryId: supplierArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 3,
        tags: { deleteMany: {}, create: articleTagLinks([supplierTag]) }
      },
      create: {
        slug: 'how-to-choose-supplier',
        title: 'Как выбрать поставщика',
        summary: 'Соберите список рабочих контактов и сравните категорию, географию, условия и стабильность поставки.',
        body: [
          'Сначала определите, что именно нужно заведению: кофе, молоко, сиропы, оборудование, стекло, расходники или сервисное обслуживание.',
          'Проверьте географию работы. Поставщик может быть удобным по ассортименту, но неудобным по срокам доставки, минимальному заказу или маршруту.',
          'Сравните условия: цена, отсрочка, частота поставок, наличие документов, возможность срочной дозакупки и контакт ответственного менеджера.',
          'Для первой закупки лучше зафиксировать короткий тест: одна категория, понятный объём и дата обратной связи от команды.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        categoryId: supplierArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 3,
        tags: { create: articleTagLinks([supplierTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'how-to-prepare-guest-shift' },
      update: {
        title: 'Как подготовить гостевую смену',
        summary: 'Короткий план для команды, которая хочет провести встречу, совместный бар или партнёрский формат.',
        body: [
          'Гостевая смена начинается с понятной цели: представить бар, познакомить команды, показать продукт или собрать аудиторию вокруг темы.',
          'Опишите площадку, дату, примерное время, роли участников и формат меню. Если нужен партнёр, заранее укажите, какая помощь требуется.',
          'Подготовьте анонс: тема, кто участвует, почему гостю стоит прийти и как попасть на событие. Не перегружайте текст внутренними деталями.',
          'После события соберите короткий итог: сколько гостей пришло, какие позиции работали лучше, какие контакты появились и что можно повторить.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(4),
        archivedAt: null,
        categoryId: eventArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 4,
        sortOrder: 4,
        tags: { deleteMany: {}, create: articleTagLinks([eventTag]) }
      },
      create: {
        slug: 'how-to-prepare-guest-shift',
        title: 'Как подготовить гостевую смену',
        summary: 'Короткий план для команды, которая хочет провести встречу, совместный бар или партнёрский формат.',
        body: [
          'Гостевая смена начинается с понятной цели: представить бар, познакомить команды, показать продукт или собрать аудиторию вокруг темы.',
          'Опишите площадку, дату, примерное время, роли участников и формат меню. Если нужен партнёр, заранее укажите, какая помощь требуется.',
          'Подготовьте анонс: тема, кто участвует, почему гостю стоит прийти и как попасть на событие. Не перегружайте текст внутренними деталями.',
          'После события соберите короткий итог: сколько гостей пришло, какие позиции работали лучше, какие контакты появились и что можно повторить.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(4),
        categoryId: eventArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 4,
        sortOrder: 4,
        tags: { create: articleTagLinks([eventTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'skfo-bar-industry-map' },
      update: {
        title: 'Карта барной индустрии СКФО',
        summary: 'Короткий обзор того, какие участники рынка чаще всего нужны специалистам, заведениям и партнёрам.',
        body: [
          'Региональная карта индустрии помогает быстро понять, кто рядом: заведения, школы, поставщики, бренды, площадки для событий и специалисты.',
          'Для специалиста такая карта отвечает на вопрос, где учиться, куда откликаться и какие события стоит отслеживать.',
          'Для заведения она помогает собрать контакты поставщиков, экспертов, кандидатов и партнёров для запуска новых форматов.',
          'Для бренда или сервиса карта показывает, с кем можно обсудить событие, материал, обучение или пилотный проект.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        archivedAt: null,
        categoryId: regionArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 5,
        tags: { deleteMany: {}, create: articleTagLinks([regionTag]) }
      },
      create: {
        slug: 'skfo-bar-industry-map',
        title: 'Карта барной индустрии СКФО',
        summary: 'Короткий обзор того, какие участники рынка чаще всего нужны специалистам, заведениям и партнёрам.',
        body: [
          'Региональная карта индустрии помогает быстро понять, кто рядом: заведения, школы, поставщики, бренды, площадки для событий и специалисты.',
          'Для специалиста такая карта отвечает на вопрос, где учиться, куда откликаться и какие события стоит отслеживать.',
          'Для заведения она помогает собрать контакты поставщиков, экспертов, кандидатов и партнёров для запуска новых форматов.',
          'Для бренда или сервиса карта показывает, с кем можно обсудить событие, материал, обучение или пилотный проект.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        categoryId: regionArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        sourceLabel: 'Тестовый материал',
        readingTimeMinutes: 3,
        sortOrder: 5,
        tags: { create: articleTagLinks([regionTag]) }
      }
    })
  ]);

  const [articleOne, articleTwo, eventOne, eventTwo] = await Promise.all([
    prisma.article.upsert({
      where: { slug: 'demo-weekly-editorial-roundup' },
      update: {
        title: 'Подборка недели для барных команд',
        summary: 'Короткая редакционная подборка тем, кейсов и новых запусков для владельцев и управляющих.',
        body: 'Демо-материал для показа заполненной админки.',
        status: ContentStatus.DRAFT
      },
      create: {
        slug: 'demo-weekly-editorial-roundup',
        title: 'Подборка недели для барных команд',
        summary: 'Короткая редакционная подборка тем, кейсов и новых запусков для владельцев и управляющих.',
        body: 'Демо-материал для показа заполненной админки.',
        status: ContentStatus.DRAFT
      }
    }),
    prisma.article.upsert({
      where: { slug: 'demo-spring-menu-notes' },
      update: {
        title: 'Весенние заметки по меню и подаче',
        summary: 'Черновик материала про сезонные позиции, сервировку и скорость вывода новых напитков.',
        body: 'Демо-материал для показа заполненной админки.',
        status: ContentStatus.DRAFT
      },
      create: {
        slug: 'demo-spring-menu-notes',
        title: 'Весенние заметки по меню и подаче',
        summary: 'Черновик материала про сезонные позиции, сервировку и скорость вывода новых напитков.',
        body: 'Демо-материал для показа заполненной админки.',
        status: ContentStatus.DRAFT
      }
    }),
    prisma.event.upsert({
      where: { slug: 'demo-regional-guest-shift' },
      update: {
        title: 'Гостевая смена с региональными барами',
        summary: 'Гостевая смена для команд региона: совместный бар, обмен сервисными практиками и открытая регистрация для специалистов.',
        startsAt: daysAgo(-12),
        locationName: 'Atelier 12',
        address: 'Махачкала, улица Даниялова, 12',
        format: 'offline',
        status: ContentStatus.DRAFT
      },
      create: {
        slug: 'demo-regional-guest-shift',
        title: 'Гостевая смена с региональными барами',
        summary: 'Гостевая смена для команд региона: совместный бар, обмен сервисными практиками и открытая регистрация для специалистов.',
        startsAt: daysAgo(-12),
        locationName: 'Atelier 12',
        address: 'Махачкала, улица Даниялова, 12',
        format: 'offline',
        status: ContentStatus.DRAFT
      }
    }),
    prisma.event.upsert({
      where: { slug: 'demo-coffee-service-intensive' },
      update: {
        title: 'Интенсив по сервису и работе с гостем',
        summary: 'Практический интенсив по сервису, работе с гостем и координации смены для бариста, барменов и менеджеров.',
        startsAt: daysAgo(-21),
        locationName: 'North Hall',
        address: 'Каспийск, улица Ленина, 44',
        format: 'offline',
        status: ContentStatus.DRAFT
      },
      create: {
        slug: 'demo-coffee-service-intensive',
        title: 'Интенсив по сервису и работе с гостем',
        summary: 'Практический интенсив по сервису, работе с гостем и координации смены для бариста, барменов и менеджеров.',
        startsAt: daysAgo(-21),
        locationName: 'North Hall',
        address: 'Каспийск, улица Ленина, 44',
        format: 'offline',
        status: ContentStatus.DRAFT
      }
    })
  ]);

  const [vacancyOne, vacancyTwo, vacancyThree, vacancyFour] = await Promise.all([
    prisma.vacancy.upsert({
      where: { slug: 'senior-barista-aster-roasters-demo' },
      update: {
        title: 'Старший бариста в дневную смену',
        summary: 'Кофейня в центре Махачкалы ищет сильного бариста с опытом настройки потока и обучения смены.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        archivedAt: null,
        cityId: makhachkala.id,
        categoryId: coffeeCategory.id,
        companyName: 'Aster Roasters',
        position: 'Бариста',
        employmentType: 'Полная занятость',
        salaryLabel: 'от 70 000 ₽ + бонус',
        experienceLabel: 'от 1 года',
        contactMode: 'Telegram и телефон',
        description: 'Работа с зерном собственного обжара, гостевым потоком и обучением младших бариста.'
      },
      create: {
        slug: 'senior-barista-aster-roasters-demo',
        title: 'Старший бариста в дневную смену',
        summary: 'Кофейня в центре Махачкалы ищет сильного бариста с опытом настройки потока и обучения смены.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        cityId: makhachkala.id,
        categoryId: coffeeCategory.id,
        companyName: 'Aster Roasters',
        position: 'Бариста',
        employmentType: 'Полная занятость',
        salaryLabel: 'от 70 000 ₽ + бонус',
        experienceLabel: 'от 1 года',
        contactMode: 'Telegram и телефон',
        description: 'Работа с зерном собственного обжара, гостевым потоком и обучением младших бариста.'
      }
    }),
    prisma.vacancy.upsert({
      where: { slug: 'bar-manager-atelier-12-demo' },
      update: {
        title: 'Бар-менеджер для вечернего проекта',
        summary: 'Нужен человек, который возьмёт смены, команду и запуск сезонного меню на себя.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        archivedAt: null,
        cityId: kaspiysk.id,
        categoryId: barsCategory.id,
        companyName: 'Atelier 12',
        position: 'Управляющий',
        employmentType: 'Сменный график',
        salaryLabel: 'по результатам собеседования',
        experienceLabel: 'управление командой',
        contactMode: 'Email и Telegram',
        description: 'Проекту нужен менеджер, который держит барную карту, команду и ритм зала без постоянного микроконтроля.'
      },
      create: {
        slug: 'bar-manager-atelier-12-demo',
        title: 'Бар-менеджер для вечернего проекта',
        summary: 'Нужен человек, который возьмёт смены, команду и запуск сезонного меню на себя.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        cityId: kaspiysk.id,
        categoryId: barsCategory.id,
        companyName: 'Atelier 12',
        position: 'Управляющий',
        employmentType: 'Сменный график',
        salaryLabel: 'по результатам собеседования',
        experienceLabel: 'управление командой',
        contactMode: 'Email и Telegram',
        description: 'Проекту нужен менеджер, который держит барную карту, команду и ритм зала без постоянного микроконтроля.'
      }
    }),
    prisma.vacancy.upsert({
      where: { slug: 'shift-manager-room24-demo' },
      update: {
        title: 'Менеджер смены / бар-координатор',
        summary: 'Черновик позиции для проекта с акцентом на вечерний сервис и координацию команды в пиковые часы.',
        status: ContentStatus.DRAFT,
        publishedAt: null,
        archivedAt: null,
        cityId: derbent.id,
        categoryId: barsCategory.id,
        companyName: 'Room 24',
        position: 'Менеджер',
        employmentType: 'Гибкий график',
        salaryLabel: 'обсуждается',
        experienceLabel: 'от 2 лет',
        contactMode: 'Telegram',
        description: 'Демо-черновик для показа админского сценария публикации вакансий.'
      },
      create: {
        slug: 'shift-manager-room24-demo',
        title: 'Менеджер смены / бар-координатор',
        summary: 'Черновик позиции для проекта с акцентом на вечерний сервис и координацию команды в пиковые часы.',
        status: ContentStatus.DRAFT,
        cityId: derbent.id,
        categoryId: barsCategory.id,
        companyName: 'Room 24',
        position: 'Менеджер',
        employmentType: 'Гибкий график',
        salaryLabel: 'обсуждается',
        experienceLabel: 'от 2 лет',
        contactMode: 'Telegram',
        description: 'Демо-черновик для показа админского сценария публикации вакансий.'
      }
    }),
    prisma.vacancy.upsert({
      where: { slug: 'summer-point-barista-demo' },
      update: {
        title: 'Бариста на запуск летней точки',
        summary: 'Архивный пример сезонной позиции для летней площадки у городской кофейни.',
        status: ContentStatus.ARCHIVED,
        publishedAt: daysAgo(28),
        archivedAt: daysAgo(7),
        cityId: makhachkala.id,
        categoryId: coffeeCategory.id,
        companyName: 'Mesto Coffee',
        position: 'Бариста',
        employmentType: 'Сезонный контракт',
        salaryLabel: '60 000 ₽',
        experienceLabel: 'базовый опыт',
        contactMode: 'Телефон',
        description: 'Демо-архив для показа полного набора статусов в админке.'
      },
      create: {
        slug: 'summer-point-barista-demo',
        title: 'Бариста на запуск летней точки',
        summary: 'Архивный пример сезонной позиции для летней площадки у городской кофейни.',
        status: ContentStatus.ARCHIVED,
        publishedAt: daysAgo(28),
        archivedAt: daysAgo(7),
        cityId: makhachkala.id,
        categoryId: coffeeCategory.id,
        companyName: 'Mesto Coffee',
        position: 'Бариста',
        employmentType: 'Сезонный контракт',
        salaryLabel: '60 000 ₽',
        experienceLabel: 'базовый опыт',
        contactMode: 'Телефон',
        description: 'Демо-архив для показа полного набора статусов в админке.'
      }
    })
  ]);

  const [supplierOne, supplierTwo, supplierThree, supplierFour] = await Promise.all([
    prisma.supplier.upsert({
      where: { slug: 'aroma-trade-south-demo' },
      update: {
        title: 'Кофе, сиропы и расходники для ежедневной работы',
        summary: 'Поставки кофе, сиропов, молока, расходников и POS-материалов для заведений разного масштаба.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        archivedAt: null,
        cityId: makhachkala.id,
        categoryId: ingredientCategory.id,
        companyName: 'Aroma Trade South',
        description: 'Демо-поставщик с упором на стабильные поставки, подбор ассортимента и работу по региону.',
        websiteUrl: 'https://aroma-trade.example',
        contactLabel: 'sales@aroma-trade.example / +7 962 120-44-10',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент'
      },
      create: {
        slug: 'aroma-trade-south-demo',
        title: 'Кофе, сиропы и расходники для ежедневной работы',
        summary: 'Поставки кофе, сиропов, молока, расходников и POS-материалов для заведений разного масштаба.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        cityId: makhachkala.id,
        categoryId: ingredientCategory.id,
        companyName: 'Aroma Trade South',
        description: 'Демо-поставщик с упором на стабильные поставки, подбор ассортимента и работу по региону.',
        websiteUrl: 'https://aroma-trade.example',
        contactLabel: 'sales@aroma-trade.example / +7 962 120-44-10',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент'
      }
    }),
    prisma.supplier.upsert({
      where: { slug: 'linea-service-equipment-demo' },
      update: {
        title: 'Барное оборудование и ледогенераторы под запуск',
        summary: 'Оснащение новых точек, подбор оборудования и сервисное сопровождение после запуска.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        archivedAt: null,
        cityId: kaspiysk.id,
        categoryId: equipmentCategory.id,
        companyName: 'Linea Service',
        description: 'Демо-поставщик оборудования с монтажом, обучением команды и регулярным сервисом.',
        websiteUrl: 'https://linea-service.example',
        contactLabel: '@linea_service / +7 928 145-45-10',
        isVerified: true,
        serviceArea: 'Каспийск и Махачкала'
      },
      create: {
        slug: 'linea-service-equipment-demo',
        title: 'Барное оборудование и ледогенераторы под запуск',
        summary: 'Оснащение новых точек, подбор оборудования и сервисное сопровождение после запуска.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        cityId: kaspiysk.id,
        categoryId: equipmentCategory.id,
        companyName: 'Linea Service',
        description: 'Демо-поставщик оборудования с монтажом, обучением команды и регулярным сервисом.',
        websiteUrl: 'https://linea-service.example',
        contactLabel: '@linea_service / +7 928 145-45-10',
        isVerified: true,
        serviceArea: 'Каспийск и Махачкала'
      }
    }),
    prisma.supplier.upsert({
      where: { slug: 'forma-glass-demo' },
      update: {
        title: 'Стекло, посуда и сервировочные позиции',
        summary: 'Подбор стекла, сервировочной посуды и предметов для сезонных обновлений бара и кухни.',
        status: ContentStatus.DRAFT,
        publishedAt: null,
        archivedAt: null,
        cityId: derbent.id,
        categoryId: ingredientCategory.id,
        companyName: 'Forma Glass',
        description: 'Демо-черновик поставщика для показа админского сценария редактирования и публикации.',
        websiteUrl: 'https://forma-glass.example',
        contactLabel: 'hello@forma-glass.example',
        isVerified: false,
        serviceArea: 'Дербент и соседние города'
      },
      create: {
        slug: 'forma-glass-demo',
        title: 'Стекло, посуда и сервировочные позиции',
        summary: 'Подбор стекла, сервировочной посуды и предметов для сезонных обновлений бара и кухни.',
        status: ContentStatus.DRAFT,
        cityId: derbent.id,
        categoryId: ingredientCategory.id,
        companyName: 'Forma Glass',
        description: 'Демо-черновик поставщика для показа админского сценария редактирования и публикации.',
        websiteUrl: 'https://forma-glass.example',
        contactLabel: 'hello@forma-glass.example',
        isVerified: false,
        serviceArea: 'Дербент и соседние города'
      }
    }),
    prisma.supplier.upsert({
      where: { slug: 'north-table-archive-demo' },
      update: {
        title: 'Архивная подборка расходников для залов',
        summary: 'Архивная запись поставщика для показа полного набора статусов в рабочем списке.',
        status: ContentStatus.ARCHIVED,
        publishedAt: daysAgo(35),
        archivedAt: daysAgo(10),
        cityId: makhachkala.id,
        categoryId: ingredientCategory.id,
        companyName: 'North Table Supply',
        description: 'Демо-архив поставщика, оставленный для показа жизненного цикла карточки.',
        websiteUrl: 'https://north-table.example',
        contactLabel: '+7 8652 00-10-20',
        isVerified: false,
        serviceArea: 'Махачкала'
      },
      create: {
        slug: 'north-table-archive-demo',
        title: 'Архивная подборка расходников для залов',
        summary: 'Архивная запись поставщика для показа полного набора статусов в рабочем списке.',
        status: ContentStatus.ARCHIVED,
        publishedAt: daysAgo(35),
        archivedAt: daysAgo(10),
        cityId: makhachkala.id,
        categoryId: ingredientCategory.id,
        companyName: 'North Table Supply',
        description: 'Демо-архив поставщика, оставленный для показа жизненного цикла карточки.',
        websiteUrl: 'https://north-table.example',
        contactLabel: '+7 8652 00-10-20',
        isVerified: false,
        serviceArea: 'Махачкала'
      }
    })
  ]);

  await Promise.all([
    prisma.application.upsert({
      where: { id: 'demo-application-vacancy-response' },
      update: {
        type: ApplicationType.VACANCY_RESPONSE,
        status: ApplicationStatus.NEW,
        subject: 'Отклик на роль старшего бариста',
        message: 'Опыт в specialty coffee, веду смену и обучение новых сотрудников.',
        name: 'Ника Орлова',
        email: 'nika.demo@example.com',
        phone: '+7 928 500-41-10',
        telegram: '@nika_demo',
        cityId: makhachkala.id,
        vacancyId: vacancyOne.id,
        consentAcceptedAt: daysAgo(1),
        consentText: 'Демо-согласие на обработку данных и передачу работодателю.'
      },
      create: {
        id: 'demo-application-vacancy-response',
        type: ApplicationType.VACANCY_RESPONSE,
        status: ApplicationStatus.NEW,
        subject: 'Отклик на роль старшего бариста',
        message: 'Опыт в specialty coffee, веду смену и обучение новых сотрудников.',
        name: 'Ника Орлова',
        email: 'nika.demo@example.com',
        phone: '+7 928 500-41-10',
        telegram: '@nika_demo',
        cityId: makhachkala.id,
        vacancyId: vacancyOne.id,
        consentAcceptedAt: daysAgo(1),
        consentText: 'Демо-согласие на обработку данных и передачу работодателю.'
      }
    }),
    prisma.application.upsert({
      where: { id: 'demo-application-vacancy-submission' },
      update: {
        type: ApplicationType.VACANCY_SUBMISSION,
        status: ApplicationStatus.IN_REVIEW,
        subject: 'Размещение вакансии для Atelier 12',
        message: 'Нужен вечерний менеджер с опытом запуска сезонной карты и управления сменой.',
        name: 'Мария Соколова',
        email: 'atelier.demo@example.com',
        phone: '+7 962 401-12-12',
        telegram: '@atelier12_team',
        cityId: kaspiysk.id,
        businessAccountId: atelierBusiness.id,
        consentAcceptedAt: daysAgo(3),
        consentText: 'Демо-согласие на обработку данных.'
      },
      create: {
        id: 'demo-application-vacancy-submission',
        type: ApplicationType.VACANCY_SUBMISSION,
        status: ApplicationStatus.IN_REVIEW,
        subject: 'Размещение вакансии для Atelier 12',
        message: 'Нужен вечерний менеджер с опытом запуска сезонной карты и управления сменой.',
        name: 'Мария Соколова',
        email: 'atelier.demo@example.com',
        phone: '+7 962 401-12-12',
        telegram: '@atelier12_team',
        cityId: kaspiysk.id,
        businessAccountId: atelierBusiness.id,
        consentAcceptedAt: daysAgo(3),
        consentText: 'Демо-согласие на обработку данных.'
      }
    }),
    prisma.application.upsert({
      where: { id: 'demo-application-supplier' },
      update: {
        type: ApplicationType.SUPPLIER_SUBMISSION,
        status: ApplicationStatus.CONTACTED,
        subject: 'Заявка поставщика Aroma Trade South',
        message: 'Хотим зайти в каталог по кофе, сиропам и расходникам.',
        name: 'Егор Власов',
        email: 'sales@aroma-trade.example',
        phone: '+7 962 120-44-10',
        telegram: '@aroma_trade',
        cityId: makhachkala.id,
        consentAcceptedAt: daysAgo(4),
        consentText: 'Демо-согласие на обработку данных.'
      },
      create: {
        id: 'demo-application-supplier',
        type: ApplicationType.SUPPLIER_SUBMISSION,
        status: ApplicationStatus.CONTACTED,
        subject: 'Заявка поставщика Aroma Trade South',
        message: 'Хотим зайти в каталог по кофе, сиропам и расходникам.',
        name: 'Егор Власов',
        email: 'sales@aroma-trade.example',
        phone: '+7 962 120-44-10',
        telegram: '@aroma_trade',
        cityId: makhachkala.id,
        consentAcceptedAt: daysAgo(4),
        consentText: 'Демо-согласие на обработку данных.'
      }
    }),
    prisma.application.upsert({
      where: { id: 'demo-application-business-access' },
      update: {
        type: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
        status: ApplicationStatus.NEW,
        subject: 'Бизнес-доступ для Linea Service',
        message: 'Нужен кабинет для поставщика оборудования и сервисной команды.',
        name: 'Руслан Алиев',
        email: 'demo-business-linea@barsynergy.local',
        phone: '+7 928 145-45-10',
        telegram: '@linea_service',
        cityId: kaspiysk.id,
        businessAccountId: lineaBusiness.id,
        consentAcceptedAt: daysAgo(2),
        consentText: 'Демо-согласие на обработку данных.'
      },
      create: {
        id: 'demo-application-business-access',
        type: ApplicationType.BUSINESS_ACCOUNT_REQUEST,
        status: ApplicationStatus.NEW,
        subject: 'Бизнес-доступ для Linea Service',
        message: 'Нужен кабинет для поставщика оборудования и сервисной команды.',
        name: 'Руслан Алиев',
        email: 'demo-business-linea@barsynergy.local',
        phone: '+7 928 145-45-10',
        telegram: '@linea_service',
        cityId: kaspiysk.id,
        businessAccountId: lineaBusiness.id,
        consentAcceptedAt: daysAgo(2),
        consentText: 'Демо-согласие на обработку данных.'
      }
    })
  ]);

  console.log('Demo screen data is ready.');
  console.log(`Cities: ${makhachkala.name}, ${kaspiysk.name}, ${derbent.name}`);
  console.log(`Vacancies: ${vacancyOne.title}, ${vacancyTwo.title}, ${vacancyThree.title}, ${vacancyFour.title}`);
  console.log(`Suppliers: ${supplierOne.companyName}, ${supplierTwo.companyName}, ${supplierThree.companyName}, ${supplierFour.companyName}`);
  console.log(`Published test articles: ${starterArticles.map((article) => article.slug).join(', ')}`);
  console.log(`Draft content: ${articleOne.slug}, ${articleTwo.slug}, ${eventOne.slug}, ${eventTwo.slug}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
