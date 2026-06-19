import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import {
  ApplicationStatus,
  ApplicationType,
  BusinessAccountStatus,
  CategoryType,
  ContentStatus,
  EmploymentType,
  JobSearchStatus,
  MasterEntityType,
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

  const [
    makhachkala,
    kaspiysk,
    derbent,
    barsCategory,
    coffeeCategory,
    ingredientCategory,
    equipmentCategory,
    masterConsultingCategory,
    masterTechnicalCategory,
    eventCategory,
    courseCategory
  ] = await Promise.all([
    upsertCity({ name: 'Махачкала', slug: 'makhachkala', region: 'Республика Дагестан', sortOrder: 1 }),
    upsertCity({ name: 'Каспийск', slug: 'kaspiysk', region: 'Республика Дагестан', sortOrder: 2 }),
    upsertCity({ name: 'Дербент', slug: 'derbent', region: 'Республика Дагестан', sortOrder: 3 }),
    upsertCategory({ name: 'Бары', slug: 'bars', type: CategoryType.VACANCY, sortOrder: 1 }),
    upsertCategory({ name: 'Кофейни', slug: 'coffee-shops', type: CategoryType.VACANCY, sortOrder: 2 }),
    upsertCategory({ name: 'Ингредиенты', slug: 'ingredients', type: CategoryType.SUPPLIER, sortOrder: 1 }),
    upsertCategory({ name: 'Оборудование', slug: 'equipment', type: CategoryType.SUPPLIER, sortOrder: 2 }),
    upsertCategory({ name: 'Настройка бара', slug: 'bar-setup', type: CategoryType.MASTER, sortOrder: 1 }),
    upsertCategory({ name: 'Сервис оборудования', slug: 'equipment-service', type: CategoryType.MASTER, sortOrder: 2 }),
    upsertCategory({ name: 'События индустрии', slug: 'industry-events', type: CategoryType.EVENT, sortOrder: 1 }),
    upsertCategory({ name: 'Практическое обучение', slug: 'practical-training', type: CategoryType.COURSE, sortOrder: 1 })
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

  const demoProfileUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo-profile-amir@barsynergy.local' },
      update: {
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      },
      create: {
        email: 'demo-profile-amir@barsynergy.local',
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      }
    }),
    prisma.user.upsert({
      where: { email: 'demo-profile-elena@barsynergy.local' },
      update: {
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      },
      create: {
        email: 'demo-profile-elena@barsynergy.local',
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      }
    }),
    prisma.user.upsert({
      where: { email: 'demo-profile-nikita@barsynergy.local' },
      update: {
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      },
      create: {
        email: 'demo-profile-nikita@barsynergy.local',
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      }
    })
  ]);

  const [amirUser, elenaUser, nikitaUser] = demoProfileUsers;

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

  const [menuArticleCategory, teamArticleCategory, supplierArticleCategory, eventArticleCategory, regionArticleCategory, businessArticleCategory, equipmentArticleCategory, roastingArticleCategory, trainingArticleCategory] = await Promise.all([
    upsertCategory({ name: 'Меню', slug: 'menu', type: CategoryType.ARTICLE, sortOrder: 1 }),
    upsertCategory({ name: 'Команда', slug: 'team', type: CategoryType.ARTICLE, sortOrder: 2 }),
    upsertCategory({ name: 'Поставщики', slug: 'suppliers', type: CategoryType.ARTICLE, sortOrder: 3 }),
    upsertCategory({ name: 'События', slug: 'events', type: CategoryType.ARTICLE, sortOrder: 4 }),
    upsertCategory({ name: 'Индустрия региона', slug: 'regional-industry', type: CategoryType.ARTICLE, sortOrder: 5 }),
    upsertCategory({ name: 'Бизнес', slug: 'business', type: CategoryType.ARTICLE, sortOrder: 6 }),
    upsertCategory({ name: 'Оборудование', slug: 'equipment', type: CategoryType.ARTICLE, sortOrder: 7 }),
    upsertCategory({ name: 'Обжарка', slug: 'roasting', type: CategoryType.ARTICLE, sortOrder: 8 }),
    upsertCategory({ name: 'Обучение', slug: 'training', type: CategoryType.ARTICLE, sortOrder: 9 })
  ]);

  const [calculatorTag, hiringTag, supplierTag, eventTag, regionTag, trendsTag, specialtyTag, menuTag, coffeeShopTag, espressoTag, costPriceTag, pricesTag, scaTag, cvaTag, coffeeAssessmentTag, roastersTag, coldBrewTag, rtdTag, seasonalDrinksTag, brewTag, baristaTag, extractionTag, workflowTag] = await Promise.all([
    upsertTag({ name: 'Калькулятор', slug: 'calculator', type: CategoryType.ARTICLE, sortOrder: 1 }),
    upsertTag({ name: 'Найм', slug: 'hiring', type: CategoryType.ARTICLE, sortOrder: 2 }),
    upsertTag({ name: 'Поставщики', slug: 'supplier-list', type: CategoryType.ARTICLE, sortOrder: 3 }),
    upsertTag({ name: 'Гостевая смена', slug: 'guest-shift', type: CategoryType.ARTICLE, sortOrder: 4 }),
    upsertTag({ name: 'СКФО', slug: 'skfo', type: CategoryType.ARTICLE, sortOrder: 5 }),
    upsertTag({ name: 'Тренды', slug: 'trends', type: CategoryType.ARTICLE, sortOrder: 6 }),
    upsertTag({ name: 'Specialty', slug: 'specialty', type: CategoryType.ARTICLE, sortOrder: 7 }),
    upsertTag({ name: 'Меню', slug: 'menu-tag', type: CategoryType.ARTICLE, sortOrder: 8 }),
    upsertTag({ name: 'Кофейня', slug: 'coffee-shop-tag', type: CategoryType.ARTICLE, sortOrder: 9 }),
    upsertTag({ name: 'Эспрессо', slug: 'espresso', type: CategoryType.ARTICLE, sortOrder: 10 }),
    upsertTag({ name: 'Себестоимость', slug: 'cost-price', type: CategoryType.ARTICLE, sortOrder: 11 }),
    upsertTag({ name: 'Цены', slug: 'prices', type: CategoryType.ARTICLE, sortOrder: 12 }),
    upsertTag({ name: 'SCA', slug: 'sca', type: CategoryType.ARTICLE, sortOrder: 13 }),
    upsertTag({ name: 'CVA', slug: 'cva', type: CategoryType.ARTICLE, sortOrder: 14 }),
    upsertTag({ name: 'Оценка кофе', slug: 'coffee-assessment', type: CategoryType.ARTICLE, sortOrder: 15 }),
    upsertTag({ name: 'Обжарщики', slug: 'roasters', type: CategoryType.ARTICLE, sortOrder: 16 }),
    upsertTag({ name: 'Cold Brew', slug: 'cold-brew', type: CategoryType.ARTICLE, sortOrder: 17 }),
    upsertTag({ name: 'RTD', slug: 'rtd', type: CategoryType.ARTICLE, sortOrder: 18 }),
    upsertTag({ name: 'Сезонные напитки', slug: 'seasonal-drinks', type: CategoryType.ARTICLE, sortOrder: 19 }),
    upsertTag({ name: 'Brew', slug: 'brew', type: CategoryType.ARTICLE, sortOrder: 20 }),
    upsertTag({ name: 'Бариста', slug: 'barista', type: CategoryType.ARTICLE, sortOrder: 21 }),
    upsertTag({ name: 'Экстракция', slug: 'extraction', type: CategoryType.ARTICLE, sortOrder: 22 }),
    upsertTag({ name: 'Workflow', slug: 'workflow', type: CategoryType.ARTICLE, sortOrder: 23 })
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

  const newArticles = await Promise.all([
    prisma.article.upsert({
      where: { slug: 'specialty-coffee-2025-2026' },
      update: {
        title: 'Что меняется в specialty coffee и как кофейням адаптироваться',
        summary: 'Specialty уже не только про «чистый вкус» и идеальную экстракцию. Аудитория меняется, и кофейням важно понимать новые ожидания гостей, чтобы оставаться востребованными.',
        body: [
          'Долгое время specialty coffee ассоциировался с минимализмом: чистый вкус, прозрачная цепочка поставок, акцент на происхождение зерна и точность заваривания. Это по-прежнему основа культуры, но аудитория расширяется, и вместе с ней меняются ожидания.',
          '## Что меняется в поведении гостей',
          'Главный сдвиг последних лет — запрос на гибкость. Гость хочет specialty-качество, но не всегда готов к классическому формату. Молодая аудитория ищет разнообразие: напитки с добавками, холодные форматы, необычные вкусовые сочетания.',
          'Кофейня больше не может рассчитывать только на эспрессо и фильтр. Гости ждут, что в меню будет сезонная ротация, альтернативное молоко по умолчанию, понятные описания вкуса без профессионального жаргона и возможность попробовать что-то новое без погружения в теорию.',
          '## Почему signature drinks и cold coffee становятся важнее',
          'Авторские напитки — это способ показать экспертизу, не перегружая гостя. Signature drink может быть точкой входа в specialty: гость пробует напиток, который ему понятен и вкусен, а затем начинает интересоваться зерном и способами заваривания.',
          'Холодный кофе перестаёт быть летней опцией. Cold brew, ice latte, espresso tonic и bottled RTD-форматы круглый год присутствуют в меню успешных кофеен. Это отдельная категория, которая требует собственного подхода к себестоимости, заготовкам и подаче.',
          '## Как не потерять specialty-идентичность',
          'Главный риск — в погоне за аудиторией размыть позиционирование. Решение не в том, чтобы отказаться от стандартов, а в том, чтобы сделать их доступнее.',
          'Прозрачность остаётся ключевой ценностью: гость должен понимать, какое зерно используется, откуда оно и почему выбрано. Но формат подачи этой информации можно адаптировать. Вместо длинной лекции — одна фраза в меню. Вместо дегустационного протокола — понятное описание вкуса. Вместо закрытого комьюнити — открытые degustation-вечера.',
          '## Что делать кофейне уже сейчас',
          'Меню: добавьте 2–3 позиции холодного кофе и хотя бы один сезонный signature drink. Обновляйте ротацию раз в квартал.',
          'Коммуникация: перепишите описания напитков простым языком. Уберите профессиональный жаргон из гостевой зоны. Расскажите о зерне коротко и понятно.',
          'Обучение команды: бариста должен уметь объяснить разницу между напитками за 15 секунд, а не за 5 минут. Тренируйте короткие дегустационные презентации.',
          'Гибкость форматов: продумайте позиции, которые можно взять с собой. Даже если вы не планируете полноценное RTD-направление, бутылка cold brew или фирменный чай в стакане расширяют охват.',
          'Главный вывод: гибкость становится конкурентным преимуществом. Кофейня, которая сохраняет качество зерна и заваривания, но при этом говорит с гостем на его языке, выигрывает у той, что держится за закрытый формат «только для своих».'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        archivedAt: null,
        categoryId: businessArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 7,
        sortOrder: 10,
        sourceReferences: '- [Perfect Daily Grind — Specialty coffee trends](https://perfectdailygrind.com/)\n- [SCA — Consumer research](https://sca.coffee/)',
        tags: { deleteMany: {}, create: articleTagLinks([trendsTag, specialtyTag, menuTag, coffeeShopTag]) }
      },
      create: {
        slug: 'specialty-coffee-2025-2026',
        title: 'Что меняется в specialty coffee и как кофейням адаптироваться',
        summary: 'Specialty уже не только про «чистый вкус» и идеальную экстракцию. Аудитория меняется, и кофейням важно понимать новые ожидания гостей, чтобы оставаться востребованными.',
        body: [
          'Долгое время specialty coffee ассоциировался с минимализмом: чистый вкус, прозрачная цепочка поставок, акцент на происхождение зерна и точность заваривания. Это по-прежнему основа культуры, но аудитория расширяется, и вместе с ней меняются ожидания.',
          '## Что меняется в поведении гостей',
          'Главный сдвиг последних лет — запрос на гибкость. Гость хочет specialty-качество, но не всегда готов к классическому формату. Молодая аудитория ищет разнообразие: напитки с добавками, холодные форматы, необычные вкусовые сочетания.',
          'Кофейня больше не может рассчитывать только на эспрессо и фильтр. Гости ждут, что в меню будет сезонная ротация, альтернативное молоко по умолчанию, понятные описания вкуса без профессионального жаргона и возможность попробовать что-то новое без погружения в теорию.',
          '## Почему signature drinks и cold coffee становятся важнее',
          'Авторские напитки — это способ показать экспертизу, не перегружая гостя. Signature drink может быть точкой входа в specialty: гость пробует напиток, который ему понятен и вкусен, а затем начинает интересоваться зерном и способами заваривания.',
          'Холодный кофе перестаёт быть летней опцией. Cold brew, ice latte, espresso tonic и bottled RTD-форматы круглый год присутствуют в меню успешных кофеен. Это отдельная категория, которая требует собственного подхода к себестоимости, заготовкам и подаче.',
          '## Как не потерять specialty-идентичность',
          'Главный риск — в погоне за аудиторией размыть позиционирование. Решение не в том, чтобы отказаться от стандартов, а в том, чтобы сделать их доступнее.',
          'Прозрачность остаётся ключевой ценностью: гость должен понимать, какое зерно используется, откуда оно и почему выбрано. Но формат подачи этой информации можно адаптировать. Вместо длинной лекции — одна фраза в меню. Вместо дегустационного протокола — понятное описание вкуса. Вместо закрытого комьюнити — открытые degustation-вечера.',
          '## Что делать кофейне уже сейчас',
          'Меню: добавьте 2–3 позиции холодного кофе и хотя бы один сезонный signature drink. Обновляйте ротацию раз в квартал.',
          'Коммуникация: перепишите описания напитков простым языком. Уберите профессиональный жаргон из гостевой зоны. Расскажите о зерне коротко и понятно.',
          'Обучение команды: бариста должен уметь объяснить разницу между напитками за 15 секунд, а не за 5 минут. Тренируйте короткие дегустационные презентации.',
          'Гибкость форматов: продумайте позиции, которые можно взять с собой. Даже если вы не планируете полноценное RTD-направление, бутылка cold brew или фирменный чай в стакане расширяют охват.',
          'Главный вывод: гибкость становится конкурентным преимуществом. Кофейня, которая сохраняет качество зерна и заваривания, но при этом говорит с гостем на его языке, выигрывает у той, что держится за закрытый формат «только для своих».'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        categoryId: businessArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 7,
        sortOrder: 10,
        sourceReferences: '- [Perfect Daily Grind — Specialty coffee trends](https://perfectdailygrind.com/)\n- [SCA — Consumer research](https://sca.coffee/)',
        tags: { create: articleTagLinks([trendsTag, specialtyTag, menuTag, coffeeShopTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'why-coffee-prices-are-rising' },
      update: {
        title: 'Почему кофе дорожает и как кофейне пересчитать меню без хаоса',
        summary: 'Цена чашки растёт не только из-за зерна. Молоко, стаканы, аренда, зарплаты и коммунальные расходы — все статьи затрат меняются. Разбираем, как спокойно пересчитать меню и не потерять гостя.',
        body: [
          'Рост цен в кофейнях — чувствительная тема. Гость видит итоговую цифру в меню, но за ней стоит цепочка затрат, которая редко остаётся стабильной больше одного сезона.',
          '## Почему цена чашки растёт не только из-за зерна',
          'Зеленое зерно действительно дорожает: влияют урожайность, логистика, курс валют и спрос на качественные лоты. Но зерно — только часть себестоимости. Параллельно растут цены на молоко и альтернативное молоко, стаканы и крышки, моющие средства, воду и электроэнергию. Аренда индексируется, зарплаты пересматриваются, появляются новые требования к упаковке и маркировке.',
          '## Какие статьи затрат влияют на цену',
          'Зерно — базовая стоимость сырья на порцию. Молоко — часто вторая по весу статья после зерна, особенно для капучино и латте. Стаканы и крышки — расходники, которые дорожают при каждом обновлении партии. Аренда — фиксированная нагрузка, которая не зависит от количества проданных чашек. Зарплаты — растущая статья, особенно при дефиците опытных бариста. Коммунальные расходы — вода, электричество, вывоз мусора. Списания — зерно на настройку, проливы, возвраты и потери.',
          '## Почему нельзя держать старую цену «по привычке»',
          'Работа с устаревшей себестоимостью приводит к постепенному сжатию маржи. Кофейня может оставаться заполненной, но терять прибыль с каждого напитка. Месяц за месяцем это накапливается, и в какой-то момент покрыть разницу становится невозможно без резкого скачка цен — а резкое повышение гость воспринимает хуже, чем плановое.',
          '## Как пересчитать напитки через food cost',
          'Пищевая себестоимость напитка — это сумма всех ингредиентов в порции. Для каждой позиции меню запишите все компоненты и их расход на порцию. Затем по каждому компоненту посчитайте: цена упаковки делится на размер упаковки и умножается на расход в рецепте. Сложите все строки — это себестоимость порции.',
          'Затем определите целевой процент food cost. Стандартный ориентир для кофейни — 25–35% в зависимости от формата и региона. Разделите себестоимость на целевой процент — получите минимальную цену продажи. Сравните с рынком, подачей и ожиданиями гостей.',
          '## Пример: капучино',
          'Эспрессо (18 г зерна при цене 3500 р./кг): 63 р. Молоко (200 мл при цене 90 р./л): 18 р. Стакан с крышкой: 15 р. Итого себестоимость: 96 р. При food cost 30% минимальная цена: 320 р.',
          '## Пример: фильтр-кофе',
          'Зерно (20 г при цене 4000 р./кг): 80 р. Фильтр-пакет: 10 р. Стакан с крышкой: 15 р. Итого себестоимость: 105 р. При food cost 30% минимальная цена: 350 р.',
          '## Пример: латте',
          'Эспрессо (18 г зерна): 63 р. Молоко (280 мл): 25 р. Стакан с крышкой: 15 р. Итого себестоимость: 103 р. При food cost 30% минимальная цена: 343 р.',
          'Плановый пересчёт меню раз в квартал — это не паника и не жадность, а регулярная гигиена бизнеса. Используйте калькулятор себестоимости на платформе BARSYNERGY, чтобы быстро проверить текущие позиции и увидеть, какие напитки требуют корректировки.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        archivedAt: null,
        categoryId: businessArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 11,
        sourceReferences: '- [Daily Coffee News — Coffee inflation](https://dailycoffeenews.com/)\n- [Perfect Daily Grind — Costing guide](https://perfectdailygrind.com/)',
        tags: { deleteMany: {}, create: articleTagLinks([costPriceTag, pricesTag, menuTag, calculatorTag]) }
      },
      create: {
        slug: 'why-coffee-prices-are-rising',
        title: 'Почему кофе дорожает и как кофейне пересчитать меню без хаоса',
        summary: 'Цена чашки растёт не только из-за зерна. Молоко, стаканы, аренда, зарплаты и коммунальные расходы — все статьи затрат меняются. Разбираем, как спокойно пересчитать меню и не потерять гостя.',
        body: [
          'Рост цен в кофейнях — чувствительная тема. Гость видит итоговую цифру в меню, но за ней стоит цепочка затрат, которая редко остаётся стабильной больше одного сезона.',
          '## Почему цена чашки растёт не только из-за зерна',
          'Зеленое зерно действительно дорожает: влияют урожайность, логистика, курс валют и спрос на качественные лоты. Но зерно — только часть себестоимости. Параллельно растут цены на молоко и альтернативное молоко, стаканы и крышки, моющие средства, воду и электроэнергию. Аренда индексируется, зарплаты пересматриваются, появляются новые требования к упаковке и маркировке.',
          '## Какие статьи затрат влияют на цену',
          'Зерно — базовая стоимость сырья на порцию. Молоко — часто вторая по весу статья после зерна, особенно для капучино и латте. Стаканы и крышки — расходники, которые дорожают при каждом обновлении партии. Аренда — фиксированная нагрузка, которая не зависит от количества проданных чашек. Зарплаты — растущая статья, особенно при дефиците опытных бариста. Коммунальные расходы — вода, электричество, вывоз мусора. Списания — зерно на настройку, проливы, возвраты и потери.',
          '## Почему нельзя держать старую цену «по привычке»',
          'Работа с устаревшей себестоимостью приводит к постепенному сжатию маржи. Кофейня может оставаться заполненной, но терять прибыль с каждого напитка. Месяц за месяцем это накапливается, и в какой-то момент покрыть разницу становится невозможно без резкого скачка цен — а резкое повышение гость воспринимает хуже, чем плановое.',
          '## Как пересчитать напитки через food cost',
          'Пищевая себестоимость напитка — это сумма всех ингредиентов в порции. Для каждой позиции меню запишите все компоненты и их расход на порцию. Затем по каждому компоненту посчитайте: цена упаковки делится на размер упаковки и умножается на расход в рецепте. Сложите все строки — это себестоимость порции.',
          'Затем определите целевой процент food cost. Стандартный ориентир для кофейни — 25–35% в зависимости от формата и региона. Разделите себестоимость на целевой процент — получите минимальную цену продажи. Сравните с рынком, подачей и ожиданиями гостей.',
          '## Пример: капучино',
          'Эспрессо (18 г зерна при цене 3500 р./кг): 63 р. Молоко (200 мл при цене 90 р./л): 18 р. Стакан с крышкой: 15 р. Итого себестоимость: 96 р. При food cost 30% минимальная цена: 320 р.',
          '## Пример: фильтр-кофе',
          'Зерно (20 г при цене 4000 р./кг): 80 р. Фильтр-пакет: 10 р. Стакан с крышкой: 15 р. Итого себестоимость: 105 р. При food cost 30% минимальная цена: 350 р.',
          '## Пример: латте',
          'Эспрессо (18 г зерна): 63 р. Молоко (280 мл): 25 р. Стакан с крышкой: 15 р. Итого себестоимость: 103 р. При food cost 30% минимальная цена: 343 р.',
          'Плановый пересчёт меню раз в квартал — это не паника и не жадность, а регулярная гигиена бизнеса. Используйте калькулятор себестоимости на платформе BARSYNERGY, чтобы быстро проверить текущие позиции и увидеть, какие напитки требуют корректировки.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        categoryId: businessArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 11,
        sourceReferences: '- [Daily Coffee News — Coffee inflation](https://dailycoffeenews.com/)\n- [Perfect Daily Grind — Costing guide](https://perfectdailygrind.com/)',
        tags: { create: articleTagLinks([costPriceTag, pricesTag, menuTag, calculatorTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'how-to-choose-espresso-machine' },
      update: {
        title: 'Как выбрать эспрессо-машину для кофейни: не только цена и бренд',
        summary: 'Покупка эспрессо-машины — серьёзное бизнес-решение. Кофейня должна понимать свой бренд, поток гостей и операционные задачи до выбора оборудования. Практический гайд для владельцев.',
        body: [
          'Эспрессо-машина — не просто оборудование. Это сердце кофейни, которое определяет скорость работы, качество напитка, нагрузку на бариста и даже планировку бара. Ошибка при выборе стоит дорого: замена машины через полгода после открытия — это повторные затраты, простой и переобучение команды.',
          '## На что смотреть перед покупкой',
          'Поток гостей — первый и главный параметр. Для кофейни с потоком до 100 чашек в день достаточно одногруппной машины. При 100–250 чашках нужна двухгруппная. Больше 250 чашек в пиковые часы — рассматривайте двухгруппную с высокой производительностью или две машины.',
          'Количество бариста на смене определяет количество групп. Один бариста эффективно работает с одной группой. Два бариста в пик — нужна двухгруппная машина. Три и больше — двухгруппная плюс отдельная машина для резерва или специальных напитков.',
          'Меню влияет на выбор технологии. Если 80% напитков — это классический эспрессо и молочные напитки, стандартная машина с хорошей температурной стабильностью решит задачу. Если в меню есть альтернативное молоко, фильтр-кофе или авторские напитки, может потребоваться машина с независимыми бойлерами и точным контролем температуры.',
          'Стабильность температуры критична для вкуса. Многобойлерные машины держат температуру точнее, чем теплообменные. Для specialty coffee разница между 92 °C и 94 °C ощутима в чашке, поэтому машины с PID-контролем и независимыми бойлерами — стандарт для качества.',
          'Сервис и доступность запчастей — вопрос, который часто упускают. Уточните у поставщика: кто обслуживает машину в вашем регионе, какой срок реагирования на поломку, есть ли запчасти на складе и сколько времени занимает их доставка. Машина без местного сервиса — это риск простоя на дни и недели.',
          'Эргономика рабочего места — расстояние от машины до холодильника, высота группы, расположение поддона, доступ к баку с водой и сливу. Бариста проводит за машиной всю смену, и неудобная компоновка снижает скорость и повышает утомляемость.',
          '## Ошибки при выборе',
          'Не покупайте машину «на вырост» с тройным запасом по мощности — лишние группы и бойлеры потребляют энергию и занимают место. Не экономьте на сервисе ради цены машины. Не выбирайте редкую модель, если в регионе нет специалистов по её обслуживанию.',
          '## Что уточнить у поставщика перед покупкой',
          'Гарантийный срок и что именно покрывает гарантия. Наличие сервисного инженера в регионе и регламент выезда. Стоимость и периодичность планового обслуживания. Доступность базовых запчастей: прокладки, фильтры, душевые сетки. Возможность обучения команды работе с конкретной моделью. Условия trade-in или выкупа при обновлении парка.',
          '## Мини-чеклист для владельца',
          '1. Знаю дневной поток гостей в пик и в среднем.\n2. Понимаю, сколько бариста одновременно работают за машиной.\n3. Определил, какие напитки составляют 80% продаж.\n4. Уточнил наличие сервиса в регионе.\n5. Проверил эргономику: бариста протестировал рабочее место.\n6. Получил от поставщика полную стоимость владения на 3 года (машина + обслуживание + запчасти).\n7. Сравнил минимум 2–3 модели перед решением.',
          'Посмотрите раздел Поставщики на платформе BARSYNERGY — там собраны контакты компаний, которые помогут с подбором, установкой и обслуживанием оборудования для кофейни.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(4),
        archivedAt: null,
        categoryId: equipmentArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 12,
        sourceReferences: '- [Perfect Daily Grind — Espresso machine guide](https://perfectdailygrind.com/)\n- [SCA — Equipment standards](https://sca.coffee/)',
        tags: { deleteMany: {}, create: articleTagLinks([espressoTag, workflowTag, coffeeShopTag, supplierTag]) }
      },
      create: {
        slug: 'how-to-choose-espresso-machine',
        title: 'Как выбрать эспрессо-машину для кофейни: не только цена и бренд',
        summary: 'Покупка эспрессо-машины — серьёзное бизнес-решение. Кофейня должна понимать свой бренд, поток гостей и операционные задачи до выбора оборудования. Практический гайд для владельцев.',
        body: [
          'Эспрессо-машина — не просто оборудование. Это сердце кофейни, которое определяет скорость работы, качество напитка, нагрузку на бариста и даже планировку бара. Ошибка при выборе стоит дорого: замена машины через полгода после открытия — это повторные затраты, простой и переобучение команды.',
          '## На что смотреть перед покупкой',
          'Поток гостей — первый и главный параметр. Для кофейни с потоком до 100 чашек в день достаточно одногруппной машины. При 100–250 чашках нужна двухгруппная. Больше 250 чашек в пиковые часы — рассматривайте двухгруппную с высокой производительностью или две машины.',
          'Количество бариста на смене определяет количество групп. Один бариста эффективно работает с одной группой. Два бариста в пик — нужна двухгруппная машина. Три и больше — двухгруппная плюс отдельная машина для резерва или специальных напитков.',
          'Меню влияет на выбор технологии. Если 80% напитков — это классический эспрессо и молочные напитки, стандартная машина с хорошей температурной стабильностью решит задачу. Если в меню есть альтернативное молоко, фильтр-кофе или авторские напитки, может потребоваться машина с независимыми бойлерами и точным контролем температуры.',
          'Стабильность температуры критична для вкуса. Многобойлерные машины держат температуру точнее, чем теплообменные. Для specialty coffee разница между 92 °C и 94 °C ощутима в чашке, поэтому машины с PID-контролем и независимыми бойлерами — стандарт для качества.',
          'Сервис и доступность запчастей — вопрос, который часто упускают. Уточните у поставщика: кто обслуживает машину в вашем регионе, какой срок реагирования на поломку, есть ли запчасти на складе и сколько времени занимает их доставка. Машина без местного сервиса — это риск простоя на дни и недели.',
          'Эргономика рабочего места — расстояние от машины до холодильника, высота группы, расположение поддона, доступ к баку с водой и сливу. Бариста проводит за машиной всю смену, и неудобная компоновка снижает скорость и повышает утомляемость.',
          '## Ошибки при выборе',
          'Не покупайте машину «на вырост» с тройным запасом по мощности — лишние группы и бойлеры потребляют энергию и занимают место. Не экономьте на сервисе ради цены машины. Не выбирайте редкую модель, если в регионе нет специалистов по её обслуживанию.',
          '## Что уточнить у поставщика перед покупкой',
          'Гарантийный срок и что именно покрывает гарантия. Наличие сервисного инженера в регионе и регламент выезда. Стоимость и периодичность планового обслуживания. Доступность базовых запчастей: прокладки, фильтры, душевые сетки. Возможность обучения команды работе с конкретной моделью. Условия trade-in или выкупа при обновлении парка.',
          '## Мини-чеклист для владельца',
          '1. Знаю дневной поток гостей в пик и в среднем.\n2. Понимаю, сколько бариста одновременно работают за машиной.\n3. Определил, какие напитки составляют 80% продаж.\n4. Уточнил наличие сервиса в регионе.\n5. Проверил эргономику: бариста протестировал рабочее место.\n6. Получил от поставщика полную стоимость владения на 3 года (машина + обслуживание + запчасти).\n7. Сравнил минимум 2–3 модели перед решением.',
          'Посмотрите раздел Поставщики на платформе BARSYNERGY — там собраны контакты компаний, которые помогут с подбором, установкой и обслуживанием оборудования для кофейни.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(4),
        categoryId: equipmentArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 12,
        sourceReferences: '- [Perfect Daily Grind — Espresso machine guide](https://perfectdailygrind.com/)\n- [SCA — Equipment standards](https://sca.coffee/)',
        tags: { create: articleTagLinks([espressoTag, workflowTag, coffeeShopTag, supplierTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'cold-coffee-menu-category' },
      update: {
        title: 'Холодный кофе как отдельная категория меню: что стоит добавить кофейне',
        summary: 'Cold coffee — не просто летняя позиция. Холодные напитки стали самостоятельной категорией, которая работает круглый год. Какие форматы добавить в меню и как организовать процессы.',
        body: [
          'Холодный кофе перестал быть сезонной опцией. В кофейнях, которые серьёзно относятся к меню, cold brew, ice latte и авторские холодные напитки занимают постоянное место в карте и приносят стабильную выручку независимо от погоды.',
          '## Почему cold coffee — не просто летняя позиция',
          'Данные показывают устойчивый рост потребления холодного кофе круглый год. Гости выбирают холодные напитки не только в жару, но и как альтернативу сладким газировкам, как самостоятельный перекус и как формат, который удобно взять с собой. Холодный кофе привлекает аудиторию, которая не пьёт горячие напитки, и расширяет охват кофейни.',
          '## Какие форматы рассмотреть',
          'Cold brew — базовый формат. Готовится заранее методом холодного настаивания, хранится до 5–7 дней, подаётся как самостоятельный напиток или база для миксов. Требует отдельного рецепта и заготовки, но даёт стабильный вкус и низкую себестоимость порции.',
          'Ice latte — самая востребованная позиция. Эспрессо + лёд + молоко. Простая в приготовлении, понятная гостю, легко масштабируется. Важно подобрать правильное соотношение, чтобы напиток не становился водянистым при таянии льда.',
          'Espresso tonic — освежающий формат, популярный в тёплое время года. Эспрессо + тоник + лёд + долька цитруса. Яркий, запоминающийся, хорошо работает как дополнительная позиция в меню.',
          'Batch drinks — холодные напитки, приготовленные заранее в большом объёме: cold brew с добавками, холодный чай, лимонады на кофейной основе. Снижают нагрузку на бариста в пиковые часы, так как не требуют приготовления порции под заказ.',
          'Bottled / RTD — бутилированный холодный кофе, готовый к продаже. Требует отдельной упаковки и контроля срока годности, но открывает дополнительный канал продаж: навынос, партнёрские точки, доставка.',
          'Сезонные авторские напитки — точка дифференциации. Меняйте 1–2 позиции раз в сезон: весной — cold brew с ягодами, летом — цитрусовый ice latte, осенью — пряный cold brew, зимой — согревающий вариант холодного кофе со специями.',
          '## Как считать себестоимость холодных напитков',
          'Себестоимость холодного кофе часто ниже горячего: cold brew даёт высокий выход экстракта при меньшем расходе зерна на порцию, лёд — дешёвый наполнитель, а заготовки batch-формата экономят время бариста. Но добавляются расходы на упаковку (бутылки, крышки, этикетки), хранение (холодильник, отдельная зона) и возможные списания при превышении срока годности.',
          'Проверьте каждую позицию через калькулятор себестоимости: зерно, вода, лёд, добавки, упаковка. Сравните food cost холодных и горячих напитков — часто холодные позиции показывают лучшую маржинальность.',
          '## Как подготовить процессы',
          'Заготовки: выделите время в начале смены или накануне для приготовления cold brew и batch-напитков. Хранение: отдельный холодильник или выделенная полка, чёткая маркировка даты приготовления и срока годности. Скорость отдачи: холодные напитки на основе заготовок отдаются быстрее горячих — используйте это в пиковые часы. Стабильность вкуса: фиксируйте рецепты в граммах и миллилитрах, тестируйте каждую новую партию cold brew перед подачей.',
          '## Какие ошибки чаще всего делают кофейни',
          'Запускают слишком много позиций одновременно — начните с 2–3 и расширяйте по мере отладки процессов. Не считают упаковку — бутылка и этикетка могут съедать до 15% себестоимости RTD-напитка. Хранят заготовки без маркировки — риск подать просроченный продукт. Не обучают команду презентации — холодные напитки требуют такого же внимания к подаче и описанию, как горячие.',
          'Используйте калькулятор себестоимости BARSYNERGY для расчёта холодных позиций и сверьтесь с материалами по меню в разделе Материалы платформы.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        archivedAt: null,
        categoryId: menuArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 9,
        sortOrder: 13,
        sourceReferences: '- [Daily Coffee News — Cold coffee trends](https://dailycoffeenews.com/)\n- [NCA — Consumer research](https://www.ncausa.org/)',
        tags: { deleteMany: {}, create: articleTagLinks([coldBrewTag, rtdTag, menuTag, seasonalDrinksTag, calculatorTag]) }
      },
      create: {
        slug: 'cold-coffee-menu-category',
        title: 'Холодный кофе как отдельная категория меню: что стоит добавить кофейне',
        summary: 'Cold coffee — не просто летняя позиция. Холодные напитки стали самостоятельной категорией, которая работает круглый год. Какие форматы добавить в меню и как организовать процессы.',
        body: [
          'Холодный кофе перестал быть сезонной опцией. В кофейнях, которые серьёзно относятся к меню, cold brew, ice latte и авторские холодные напитки занимают постоянное место в карте и приносят стабильную выручку независимо от погоды.',
          '## Почему cold coffee — не просто летняя позиция',
          'Данные показывают устойчивый рост потребления холодного кофе круглый год. Гости выбирают холодные напитки не только в жару, но и как альтернативу сладким газировкам, как самостоятельный перекус и как формат, который удобно взять с собой. Холодный кофе привлекает аудиторию, которая не пьёт горячие напитки, и расширяет охват кофейни.',
          '## Какие форматы рассмотреть',
          'Cold brew — базовый формат. Готовится заранее методом холодного настаивания, хранится до 5–7 дней, подаётся как самостоятельный напиток или база для миксов. Требует отдельного рецепта и заготовки, но даёт стабильный вкус и низкую себестоимость порции.',
          'Ice latte — самая востребованная позиция. Эспрессо + лёд + молоко. Простая в приготовлении, понятная гостю, легко масштабируется. Важно подобрать правильное соотношение, чтобы напиток не становился водянистым при таянии льда.',
          'Espresso tonic — освежающий формат, популярный в тёплое время года. Эспрессо + тоник + лёд + долька цитруса. Яркий, запоминающийся, хорошо работает как дополнительная позиция в меню.',
          'Batch drinks — холодные напитки, приготовленные заранее в большом объёме: cold brew с добавками, холодный чай, лимонады на кофейной основе. Снижают нагрузку на бариста в пиковые часы, так как не требуют приготовления порции под заказ.',
          'Bottled / RTD — бутилированный холодный кофе, готовый к продаже. Требует отдельной упаковки и контроля срока годности, но открывает дополнительный канал продаж: навынос, партнёрские точки, доставка.',
          'Сезонные авторские напитки — точка дифференциации. Меняйте 1–2 позиции раз в сезон: весной — cold brew с ягодами, летом — цитрусовый ice latte, осенью — пряный cold brew, зимой — согревающий вариант холодного кофе со специями.',
          '## Как считать себестоимость холодных напитков',
          'Себестоимость холодного кофе часто ниже горячего: cold brew даёт высокий выход экстракта при меньшем расходе зерна на порцию, лёд — дешёвый наполнитель, а заготовки batch-формата экономят время бариста. Но добавляются расходы на упаковку (бутылки, крышки, этикетки), хранение (холодильник, отдельная зона) и возможные списания при превышении срока годности.',
          'Проверьте каждую позицию через калькулятор себестоимости: зерно, вода, лёд, добавки, упаковка. Сравните food cost холодных и горячих напитков — часто холодные позиции показывают лучшую маржинальность.',
          '## Как подготовить процессы',
          'Заготовки: выделите время в начале смены или накануне для приготовления cold brew и batch-напитков. Хранение: отдельный холодильник или выделенная полка, чёткая маркировка даты приготовления и срока годности. Скорость отдачи: холодные напитки на основе заготовок отдаются быстрее горячих — используйте это в пиковые часы. Стабильность вкуса: фиксируйте рецепты в граммах и миллилитрах, тестируйте каждую новую партию cold brew перед подачей.',
          '## Какие ошибки чаще всего делают кофейни',
          'Запускают слишком много позиций одновременно — начните с 2–3 и расширяйте по мере отладки процессов. Не считают упаковку — бутылка и этикетка могут съедать до 15% себестоимости RTD-напитка. Хранят заготовки без маркировки — риск подать просроченный продукт. Не обучают команду презентации — холодные напитки требуют такого же внимания к подаче и описанию, как горячие.',
          'Используйте калькулятор себестоимости BARSYNERGY для расчёта холодных позиций и сверьтесь с материалами по меню в разделе Материалы платформы.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        categoryId: menuArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 9,
        sortOrder: 13,
        sourceReferences: '- [Daily Coffee News — Cold coffee trends](https://dailycoffeenews.com/)\n- [NCA — Consumer research](https://www.ncausa.org/)',
        tags: { create: articleTagLinks([coldBrewTag, rtdTag, menuTag, seasonalDrinksTag, calculatorTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'bloom-filter-coffee-guide' },
      update: {
        title: 'Bloom в фильтр-кофе: когда перемешивать, а когда оставить как есть',
        summary: 'Что такое bloom, зачем он нужен и как агитация влияет на экстракцию. Практический материал для бариста: когда swirl и stir помогают, а когда могут навредить.',
        body: [
          'Bloom — это короткий этап предсмачивания в начале заваривания фильтр-кофе. За 30–45 секунд горячая вода вытесняет углекислый газ из свежемолотого зерна, подготавливая частицы к равномерной экстракции. Но вокруг bloom накопилось много вопросов: нужно ли его перемешивать, вращать или оставить в покое?',
          '## Что такое bloom и зачем он нужен',
          'Свежеобжаренное зерно содержит углекислый газ, который выделяется при контакте с горячей водой. Без bloom газ создаёт каналы в кофейной таблетке, через которые вода проходит неравномерно — часть кофе недоэкстрагируется, часть переэкстрагируется. Bloom решает эту проблему: вода насыщает весь слой кофе, газ выходит, и последующее заваривание проходит равномерно.',
          'Bloom особенно важен для светлой обжарки и зерна, обжаренного менее 2–3 недель назад. Для тёмной обжарки и зерна старше месяца bloom всё ещё полезен, но его влияние на итоговый вкус менее выражено.',
          '## Swirl, stir, no-bloom: в чём разница',
          'Swirl (вращение) — после добавления воды для bloom вы аккуратно вращаете воронку, чтобы вода равномерно распределилась по всему слою кофе. Быстрый и чистый метод, не требующий дополнительного инструмента.',
          'Stir (перемешивание) — вы используете ложку или палочку, чтобы активно перемешать кофе с водой на этапе bloom. Обеспечивает максимально равномерное смачивание, но добавляет шаг в процесс.',
          'No-bloom (пропуск bloom) — вы начинаете заваривание сразу с полного объёма воды. Некоторые рецепты для очень свежего зерна или специфических методов (например, иммерсионное заваривание) допускают такой подход, но для классического пуровера bloom рекомендуется всегда.',
          '## Как агитация влияет на экстракцию и поток',
          'Агитация на этапе bloom увеличивает экстракцию, так как вода быстрее и равномернее контактирует со всеми частицами. Это особенно полезно для светлой обжарки, которая экстрагируется медленнее и требует более агрессивного подхода.',
          'Но чрезмерная агитация может привести к миграции мелких частиц (fines) в нижнюю часть фильтра, забивая поры бумаги и замедляя поток. Результат — каналообразование, неравномерная экстракция и горький привкус.',
          'Для плотных бумажных фильтров (например, Hario) чрезмерный stir более рискован, чем для более проницаемых (например, Chemex). Учитывайте тип фильтра при выборе метода bloom.',
          '## Когда перемешивание помогает',
          'Светлая обжарка — зерно экстрагируется медленно, дополнительная агитация помогает раскрыть вкус. Большой объём заваривания (более 30 г кофе) — stir помогает равномерно смочить весь слой. Очень свежее зерно (менее недели после обжарки) — активное выделение газа требует более тщательного bloom.',
          '## Когда перемешивание может навредить',
          'Тёмная обжарка — зерно экстрагируется быстро, дополнительная агитация может привести к переэкстракции и горечи. Мелкий помол — много fines уже присутствует, stir усугубит забивание фильтра. Использование плотных бумажных фильтров — риск забивания выше.',
          '## Как тестировать рецепт в кофейне',
          'Проведите простое A/B-тестирование: приготовьте один и тот же кофе тремя способами — stir, swirl, no-bloom. Сравните время пролива, визуальное качество потока и вкус. Запишите результаты для каждого зерна в меню. Оптимальный метод зависит не только от обжарки, но и от конкретного лота, помола и воды.',
          '## Мини-протокол для бариста',
          '1. Определите обжарку: светлая → stir или swirl. Тёмная → swirl или no-bloom.\n2. Проверьте свежесть зерна: менее 1 недели → stir. 1–3 недели → swirl. Более 3 недель → swirl или no-bloom.\n3. Учтите объём: до 20 г → swirl. 20–30 г → swirl или gentle stir. Более 30 г → stir.\n4. Проведите A/B-тест для каждого нового лота.\n5. Зафиксируйте выбранный метод в рецепте и обучите команду.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        archivedAt: null,
        categoryId: trainingArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 7,
        sortOrder: 14,
        sourceReferences: '- [Perfect Daily Grind — Bloom practices](https://perfectdailygrind.com/)',
        tags: { deleteMany: {}, create: articleTagLinks([brewTag, baristaTag, extractionTag, coffeeShopTag]) }
      },
      create: {
        slug: 'bloom-filter-coffee-guide',
        title: 'Bloom в фильтр-кофе: когда перемешивать, а когда оставить как есть',
        summary: 'Что такое bloom, зачем он нужен и как агитация влияет на экстракцию. Практический материал для бариста: когда swirl и stir помогают, а когда могут навредить.',
        body: [
          'Bloom — это короткий этап предсмачивания в начале заваривания фильтр-кофе. За 30–45 секунд горячая вода вытесняет углекислый газ из свежемолотого зерна, подготавливая частицы к равномерной экстракции. Но вокруг bloom накопилось много вопросов: нужно ли его перемешивать, вращать или оставить в покое?',
          '## Что такое bloom и зачем он нужен',
          'Свежеобжаренное зерно содержит углекислый газ, который выделяется при контакте с горячей водой. Без bloom газ создаёт каналы в кофейной таблетке, через которые вода проходит неравномерно — часть кофе недоэкстрагируется, часть переэкстрагируется. Bloom решает эту проблему: вода насыщает весь слой кофе, газ выходит, и последующее заваривание проходит равномерно.',
          'Bloom особенно важен для светлой обжарки и зерна, обжаренного менее 2–3 недель назад. Для тёмной обжарки и зерна старше месяца bloom всё ещё полезен, но его влияние на итоговый вкус менее выражено.',
          '## Swirl, stir, no-bloom: в чём разница',
          'Swirl (вращение) — после добавления воды для bloom вы аккуратно вращаете воронку, чтобы вода равномерно распределилась по всему слою кофе. Быстрый и чистый метод, не требующий дополнительного инструмента.',
          'Stir (перемешивание) — вы используете ложку или палочку, чтобы активно перемешать кофе с водой на этапе bloom. Обеспечивает максимально равномерное смачивание, но добавляет шаг в процесс.',
          'No-bloom (пропуск bloom) — вы начинаете заваривание сразу с полного объёма воды. Некоторые рецепты для очень свежего зерна или специфических методов (например, иммерсионное заваривание) допускают такой подход, но для классического пуровера bloom рекомендуется всегда.',
          '## Как агитация влияет на экстракцию и поток',
          'Агитация на этапе bloom увеличивает экстракцию, так как вода быстрее и равномернее контактирует со всеми частицами. Это особенно полезно для светлой обжарки, которая экстрагируется медленнее и требует более агрессивного подхода.',
          'Но чрезмерная агитация может привести к миграции мелких частиц (fines) в нижнюю часть фильтра, забивая поры бумаги и замедляя поток. Результат — каналообразование, неравномерная экстракция и горький привкус.',
          'Для плотных бумажных фильтров (например, Hario) чрезмерный stir более рискован, чем для более проницаемых (например, Chemex). Учитывайте тип фильтра при выборе метода bloom.',
          '## Когда перемешивание помогает',
          'Светлая обжарка — зерно экстрагируется медленно, дополнительная агитация помогает раскрыть вкус. Большой объём заваривания (более 30 г кофе) — stir помогает равномерно смочить весь слой. Очень свежее зерно (менее недели после обжарки) — активное выделение газа требует более тщательного bloom.',
          '## Когда перемешивание может навредить',
          'Тёмная обжарка — зерно экстрагируется быстро, дополнительная агитация может привести к переэкстракции и горечи. Мелкий помол — много fines уже присутствует, stir усугубит забивание фильтра. Использование плотных бумажных фильтров — риск забивания выше.',
          '## Как тестировать рецепт в кофейне',
          'Проведите простое A/B-тестирование: приготовьте один и тот же кофе тремя способами — stir, swirl, no-bloom. Сравните время пролива, визуальное качество потока и вкус. Запишите результаты для каждого зерна в меню. Оптимальный метод зависит не только от обжарки, но и от конкретного лота, помола и воды.',
          '## Мини-протокол для бариста',
          '1. Определите обжарку: светлая → stir или swirl. Тёмная → swirl или no-bloom.\n2. Проверьте свежесть зерна: менее 1 недели → stir. 1–3 недели → swirl. Более 3 недель → swirl или no-bloom.\n3. Учтите объём: до 20 г → swirl. 20–30 г → swirl или gentle stir. Более 30 г → stir.\n4. Проведите A/B-тест для каждого нового лота.\n5. Зафиксируйте выбранный метод в рецепте и обучите команду.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        categoryId: trainingArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 7,
        sortOrder: 14,
        sourceReferences: '- [Perfect Daily Grind — Bloom practices](https://perfectdailygrind.com/)',
        tags: { create: articleTagLinks([brewTag, baristaTag, extractionTag, coffeeShopTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'espresso-gadgets-guide' },
      update: {
        title: 'Эспрессо-гаджеты: что реально помогает, а что усложняет workflow',
        summary: 'WDT, puck screen, калиброванный темпер и другие инструменты экстракции. Разбираем, какие гаджеты дают прирост качества, а какие замедляют бариста на потоке.',
        body: [
          'Инструменты для эспрессо-экстракции стали заметной частью индустрии. На соревнованиях бариста используют десятки гаджетов, и кофейни перенимают эти практики. Но не каждый инструмент, который хорош на чемпионате, подходит для утреннего потока в кофейне.',
          '## Почему инструменты стали популярны',
          'Рост качества зерна и требований к вкусу привёл к тому, что стандартного темпеоа и корзины уже недостаточно для стабильного результата. Одновременно соревновательная культура сделала инструменты видимыми: то, что бариста использует на сцене, быстро появляется в кофейнях.',
          'Но между соревновательным протоколом и коммерческим потоком — большая разница. На соревновании у бариста есть 15 минут на приготовление трёх напитков. В кофейне — 30 секунд на капучино в час пик. Инструмент, который добавляет 15 секунд к каждой порции, при потоке 200 чашек в день крадёт почти час рабочего времени.',
          '## Какие бывают инструменты',
          'WDT (Weiss Distribution Technique) — игольчатый инструмент для разбивания комков в молотом кофе перед темперацией. Выравнивает распределение частиц в корзине, снижает каналообразование. Самый влиятельный инструмент для стабильности экстракции.',
          'Puck screen — металлический или пластиковый экран, который кладётся поверх спрессованной кофейной таблетки. Защищает душ от загрязнения, выравнивает поток воды, помогает держать группу чище. Полезен, но добавляет шаг в процесс и требует регулярной очистки.',
          'Calibrated tamper — темпер с ограничителем глубины или пружинным механизмом. Обеспечивает одинаковое давление от порции к порции независимо от бариста. Хорош для обучения новичков и стандартизации, но менее гибок, чем ручной темпер.',
          'Distribution tools — вращающиеся распределители, которые выравнивают поверхность кофе перед темперацией. Менее эффективны, чем WDT, но быстрее в использовании. Могут создавать неравномерную плотность по глубине корзины, если настроены неправильно.',
          'Refractometer — прибор для измерения концентрации растворённых веществ в эспрессо. Даёт объективные данные об экстракции. Полезен для настройки рецепта и обучения, но не нужен на потоке — используется 1–2 раза в день при калибровке.',
          'Chilled extraction tools — охлаждённые корзины, холдеры и темперы для снижения температуры экстракции. Нишевый инструмент для специфических лотов и экспериментов. В повседневной работе кофейни не требуется.',
          '## Что даёт прирост качества',
          'WDT-игла — максимальный прирост стабильности за минимальное время. Рекомендуется для любой кофейни, работающей с качественным зерном. Puck screen — повышает чистоту вкуса и снижает частоту чистки группы. Calibrated tamper — снижает разброс между бариста одной смены.',
          '## Что замедляет бариста на потоке',
          'Многошаговые distribution tools — если инструмент требует трёх движений вместо одного, он крадёт время. Сложные puck screen с необходимостью промывки после каждой порции. Охлаждённые инструменты — требуют предварительной подготовки и не дают заметного прироста в коммерческом потоке.',
          '## Как тестировать инструмент в кофейне',
          'Выделите одну рабочую группу и одну смену для теста. Сравните скорость работы (время от помола до старта пролива), стабильность вкуса (три одинаковых эспрессо подряд), удобство для бариста и лёгкость очистки. Не вводите больше одного нового инструмента одновременно.',
          '## Чеклист: покупать или не покупать',
          'WDT-игла — да, для любой кофейни с качественным зерном.\nPuck screen — да, если команда готова к дополнительному шагу и очистке.\nCalibrated tamper — да для обучения и стандартизации, нет если бариста предпочитают ручной контроль.\nDistribution tool — нет, WDT эффективнее.\nRefractometer — да для обучения и R&D, нет для повседневного потока.\nChilled tools — нет, нишевый инструмент.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(7),
        archivedAt: null,
        categoryId: equipmentArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 15,
        sourceReferences: '- [Perfect Daily Grind — Espresso gadgets](https://perfectdailygrind.com/)',
        tags: { deleteMany: {}, create: articleTagLinks([espressoTag, workflowTag, baristaTag, coffeeShopTag]) }
      },
      create: {
        slug: 'espresso-gadgets-guide',
        title: 'Эспрессо-гаджеты: что реально помогает, а что усложняет workflow',
        summary: 'WDT, puck screen, калиброванный темпер и другие инструменты экстракции. Разбираем, какие гаджеты дают прирост качества, а какие замедляют бариста на потоке.',
        body: [
          'Инструменты для эспрессо-экстракции стали заметной частью индустрии. На соревнованиях бариста используют десятки гаджетов, и кофейни перенимают эти практики. Но не каждый инструмент, который хорош на чемпионате, подходит для утреннего потока в кофейне.',
          '## Почему инструменты стали популярны',
          'Рост качества зерна и требований к вкусу привёл к тому, что стандартного темпеоа и корзины уже недостаточно для стабильного результата. Одновременно соревновательная культура сделала инструменты видимыми: то, что бариста использует на сцене, быстро появляется в кофейнях.',
          'Но между соревновательным протоколом и коммерческим потоком — большая разница. На соревновании у бариста есть 15 минут на приготовление трёх напитков. В кофейне — 30 секунд на капучино в час пик. Инструмент, который добавляет 15 секунд к каждой порции, при потоке 200 чашек в день крадёт почти час рабочего времени.',
          '## Какие бывают инструменты',
          'WDT (Weiss Distribution Technique) — игольчатый инструмент для разбивания комков в молотом кофе перед темперацией. Выравнивает распределение частиц в корзине, снижает каналообразование. Самый влиятельный инструмент для стабильности экстракции.',
          'Puck screen — металлический или пластиковый экран, который кладётся поверх спрессованной кофейной таблетки. Защищает душ от загрязнения, выравнивает поток воды, помогает держать группу чище. Полезен, но добавляет шаг в процесс и требует регулярной очистки.',
          'Calibrated tamper — темпер с ограничителем глубины или пружинным механизмом. Обеспечивает одинаковое давление от порции к порции независимо от бариста. Хорош для обучения новичков и стандартизации, но менее гибок, чем ручной темпер.',
          'Distribution tools — вращающиеся распределители, которые выравнивают поверхность кофе перед темперацией. Менее эффективны, чем WDT, но быстрее в использовании. Могут создавать неравномерную плотность по глубине корзины, если настроены неправильно.',
          'Refractometer — прибор для измерения концентрации растворённых веществ в эспрессо. Даёт объективные данные об экстракции. Полезен для настройки рецепта и обучения, но не нужен на потоке — используется 1–2 раза в день при калибровке.',
          'Chilled extraction tools — охлаждённые корзины, холдеры и темперы для снижения температуры экстракции. Нишевый инструмент для специфических лотов и экспериментов. В повседневной работе кофейни не требуется.',
          '## Что даёт прирост качества',
          'WDT-игла — максимальный прирост стабильности за минимальное время. Рекомендуется для любой кофейни, работающей с качественным зерном. Puck screen — повышает чистоту вкуса и снижает частоту чистки группы. Calibrated tamper — снижает разброс между бариста одной смены.',
          '## Что замедляет бариста на потоке',
          'Многошаговые distribution tools — если инструмент требует трёх движений вместо одного, он крадёт время. Сложные puck screen с необходимостью промывки после каждой порции. Охлаждённые инструменты — требуют предварительной подготовки и не дают заметного прироста в коммерческом потоке.',
          '## Как тестировать инструмент в кофейне',
          'Выделите одну рабочую группу и одну смену для теста. Сравните скорость работы (время от помола до старта пролива), стабильность вкуса (три одинаковых эспрессо подряд), удобство для бариста и лёгкость очистки. Не вводите больше одного нового инструмента одновременно.',
          '## Чеклист: покупать или не покупать',
          'WDT-игла — да, для любой кофейни с качественным зерном.\nPuck screen — да, если команда готова к дополнительному шагу и очистке.\nCalibrated tamper — да для обучения и стандартизации, нет если бариста предпочитают ручной контроль.\nDistribution tool — нет, WDT эффективнее.\nRefractometer — да для обучения и R&D, нет для повседневного потока.\nChilled tools — нет, нишевый инструмент.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(7),
        categoryId: equipmentArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 15,
        sourceReferences: '- [Perfect Daily Grind — Espresso gadgets](https://perfectdailygrind.com/)',
        tags: { create: articleTagLinks([espressoTag, workflowTag, baristaTag, coffeeShopTag]) }
      }
    }),
    prisma.article.upsert({
      where: { slug: 'coffee-value-assessment-explained' },
      update: {
        title: 'Что такое Coffee Value Assessment и почему это важно для обжарщиков и закупщиков',
        summary: 'Coffee Value Assessment — новая система оценки кофе от SCA. Она даёт более полную, многослойную картину качества, выходя за рамки привычной оценки чашки. Как это работает и как применять в локальном бизнесе.',
        body: [
          'Традиционная система оценки кофе строилась вокруг каппинга: эксперт оценивает вкус, аромат, тело и баланс, выставляя баллы по шкале SCA. Эта система десятилетиями служила индустрии, но она имеет ограничения: вкус — не единственное, что делает кофе ценным.',
          '## Почему старой логики уже недостаточно',
          'Оценка только вкуса упускает важные атрибуты: происхождение, методы обработки, устойчивость производства, уникальность лота, потенциал для обжарки. Один и тот же балл могут получить совершенно разные лоты — яркий экспериментальный кофе и стабильный коммерческий лот. Закупщику и обжарщику нужна более детальная картина.',
          'Coffee Value Assessment (CVA) — ответ SCA на этот запрос. Это не замена каппингу, а расширение системы оценки. CVA описывает кофе через несколько типов оценки: физическую (размер зерна, дефекты, влажность), сенсорную (аромат, вкус, послевкусие, текстура), экстринсивную (происхождение, сертификации, методы обработки, устойчивость) и аффективную (эмоциональное восприятие, уникальность, история лота).',
          '## Что такое CVA простыми словами',
          'Представьте, что раньше кофе оценивали только по фотографии — вы видите цвет, текстуру, общий вид. CVA добавляет к фотографии описание: где выращено, как обработано, какие сертификации есть, какая история стоит за лотом, какие эмоции он вызывает. Это даёт высокодетализированное представление о кофе.',
          '## Какие параметры важны помимо вкуса',
          'Происхождение — страна, регион, ферма, высота выращивания. Метод обработки — мытая, натуральная, хани, экспериментальная. Размер зерна и плотность — влияют на профиль обжарки. Сертификации — органический, fair trade, Rainforest Alliance. История лота — кто вырастил, в каких условиях, почему этот кофе особенный.',
          '## Как CVA влияет на работу обжарщика',
          'Физические параметры (размер зерна, плотность, влажность) напрямую влияют на профиль обжарки. Зная их заранее, обжарщик точнее настраивает кривую и сокращает количество тестовых партий. Сенсорная оценка помогает предсказать, какой вкусовой профиль даст зерно при разной степени обжарки.',
          'Экстринсивные атрибуты — история лота, сертификации, устойчивость — дают материал для коммуникации с клиентами. Кофейня может рассказать не просто «у нас specialty coffee из Эфиопии», а «этот лот выращен семьёй фермеров на высоте 1900 м, обработан натуральным методом и отобран для нас локальным импортёром».',
          '## Как использовать идеи CVA в локальном бизнесе',
          'Даже если вы не работаете напрямую с SCA и не участвуете в международной оценке, принципы CVA можно применить на уровне кофейни или небольшой обжарки.',
          'При закупке зерна спрашивайте у поставщика не только балл каппинга, но и физические параметры, историю лота и методы обработки. Это поможет точнее спрогнозировать результат обжарки.',
          'При описании кофе для гостей используйте несколько слоёв информации: не только вкус (ягоды, шоколад, цветы), но и происхождение, метод обработки и историю лота. Это повышает восприятие ценности напитка.',
          'При обучении команды включайте в программу не только сенсорный тренинг, но и знания о происхождении, обработке и цепочке поставок. Бариста, который понимает весь путь зерна, увереннее общается с гостем.',
          '## Вывод',
          'Coffee Value Assessment не отменяет каппинг, а дополняет его. Для обжарщика это инструмент более точной работы с зерном. Для кофейни — источник историй и аргументов для гостя. Оценка кофе становится прозрачнее и многослойнее, и это хорошо для всей индустрии.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(8),
        archivedAt: null,
        categoryId: roastingArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 16,
        sourceReferences: '- [SCA — Coffee Value Assessment](https://sca.coffee/)\n- [Perfect Daily Grind — CVA overview](https://perfectdailygrind.com/)',
        tags: { deleteMany: {}, create: articleTagLinks([scaTag, cvaTag, coffeeAssessmentTag, roastersTag]) }
      },
      create: {
        slug: 'coffee-value-assessment-explained',
        title: 'Что такое Coffee Value Assessment и почему это важно для обжарщиков и закупщиков',
        summary: 'Coffee Value Assessment — новая система оценки кофе от SCA. Она даёт более полную, многослойную картину качества, выходя за рамки привычной оценки чашки. Как это работает и как применять в локальном бизнесе.',
        body: [
          'Традиционная система оценки кофе строилась вокруг каппинга: эксперт оценивает вкус, аромат, тело и баланс, выставляя баллы по шкале SCA. Эта система десятилетиями служила индустрии, но она имеет ограничения: вкус — не единственное, что делает кофе ценным.',
          '## Почему старой логики уже недостаточно',
          'Оценка только вкуса упускает важные атрибуты: происхождение, методы обработки, устойчивость производства, уникальность лота, потенциал для обжарки. Один и тот же балл могут получить совершенно разные лоты — яркий экспериментальный кофе и стабильный коммерческий лот. Закупщику и обжарщику нужна более детальная картина.',
          'Coffee Value Assessment (CVA) — ответ SCA на этот запрос. Это не замена каппингу, а расширение системы оценки. CVA описывает кофе через несколько типов оценки: физическую (размер зерна, дефекты, влажность), сенсорную (аромат, вкус, послевкусие, текстура), экстринсивную (происхождение, сертификации, методы обработки, устойчивость) и аффективную (эмоциональное восприятие, уникальность, история лота).',
          '## Что такое CVA простыми словами',
          'Представьте, что раньше кофе оценивали только по фотографии — вы видите цвет, текстуру, общий вид. CVA добавляет к фотографии описание: где выращено, как обработано, какие сертификации есть, какая история стоит за лотом, какие эмоции он вызывает. Это даёт высокодетализированное представление о кофе.',
          '## Какие параметры важны помимо вкуса',
          'Происхождение — страна, регион, ферма, высота выращивания. Метод обработки — мытая, натуральная, хани, экспериментальная. Размер зерна и плотность — влияют на профиль обжарки. Сертификации — органический, fair trade, Rainforest Alliance. История лота — кто вырастил, в каких условиях, почему этот кофе особенный.',
          '## Как CVA влияет на работу обжарщика',
          'Физические параметры (размер зерна, плотность, влажность) напрямую влияют на профиль обжарки. Зная их заранее, обжарщик точнее настраивает кривую и сокращает количество тестовых партий. Сенсорная оценка помогает предсказать, какой вкусовой профиль даст зерно при разной степени обжарки.',
          'Экстринсивные атрибуты — история лота, сертификации, устойчивость — дают материал для коммуникации с клиентами. Кофейня может рассказать не просто «у нас specialty coffee из Эфиопии», а «этот лот выращен семьёй фермеров на высоте 1900 м, обработан натуральным методом и отобран для нас локальным импортёром».',
          '## Как использовать идеи CVA в локальном бизнесе',
          'Даже если вы не работаете напрямую с SCA и не участвуете в международной оценке, принципы CVA можно применить на уровне кофейни или небольшой обжарки.',
          'При закупке зерна спрашивайте у поставщика не только балл каппинга, но и физические параметры, историю лота и методы обработки. Это поможет точнее спрогнозировать результат обжарки.',
          'При описании кофе для гостей используйте несколько слоёв информации: не только вкус (ягоды, шоколад, цветы), но и происхождение, метод обработки и историю лота. Это повышает восприятие ценности напитка.',
          'При обучении команды включайте в программу не только сенсорный тренинг, но и знания о происхождении, обработке и цепочке поставок. Бариста, который понимает весь путь зерна, увереннее общается с гостем.',
          '## Вывод',
          'Coffee Value Assessment не отменяет каппинг, а дополняет его. Для обжарщика это инструмент более точной работы с зерном. Для кофейни — источник историй и аргументов для гостя. Оценка кофе становится прозрачнее и многослойнее, и это хорошо для всей индустрии.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(8),
        categoryId: roastingArticleCategory.id,
        cityId: makhachkala.id,
        authorName: 'Редакция BARSYNERGY',
        readingTimeMinutes: 8,
        sortOrder: 16,
        sourceReferences: '- [SCA — Coffee Value Assessment](https://sca.coffee/)\n- [Perfect Daily Grind — CVA overview](https://perfectdailygrind.com/)',
        tags: { create: articleTagLinks([scaTag, cvaTag, coffeeAssessmentTag, roastersTag]) }
      }
    })
  ]);

  const [articleOne, articleTwo, eventOne, eventTwo, courseOne, eventThree] = await Promise.all([
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
    }),
    prisma.course.upsert({
      where: { slug: 'demo-bar-service-basics-course' },
      update: {
        title: 'Тестовое обучение: сервис за баром',
        summary: 'Короткая практическая программа для барменов и бариста: гостевой сценарий, скорость смены и базовая коммуникация.',
        program: [
          '## Что разберём',
          'Настройка гостевого сценария от приветствия до повторного заказа.',
          'Работа с базовыми возражениями без сложных скриптов.',
          'Организация станции перед пиковыми часами.',
          '## Практика',
          'Участники собирают чек-лист смены и отрабатывают короткие диалоги с гостем.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(1),
        categoryId: courseCategory.id,
        cityId: makhachkala.id,
        format: 'intensive',
        durationLabel: '2 дня',
        level: 'beginner',
        priceLabel: 'Тестовая запись',
        instructorName: 'Команда BARSYNERGY',
        sortOrder: 1
      },
      create: {
        slug: 'demo-bar-service-basics-course',
        title: 'Тестовое обучение: сервис за баром',
        summary: 'Короткая практическая программа для барменов и бариста: гостевой сценарий, скорость смены и базовая коммуникация.',
        program: [
          '## Что разберём',
          'Настройка гостевого сценария от приветствия до повторного заказа.',
          'Работа с базовыми возражениями без сложных скриптов.',
          'Организация станции перед пиковыми часами.',
          '## Практика',
          'Участники собирают чек-лист смены и отрабатывают короткие диалоги с гостем.'
        ].join('\n\n'),
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(1),
        categoryId: courseCategory.id,
        cityId: makhachkala.id,
        format: 'intensive',
        durationLabel: '2 дня',
        level: 'beginner',
        priceLabel: 'Тестовая запись',
        instructorName: 'Команда BARSYNERGY',
        sortOrder: 1
      }
    }),
    prisma.event.upsert({
      where: { slug: 'demo-bar-community-meetup' },
      update: {
        title: 'Тестовое событие: встреча барного сообщества',
        summary: 'Открытая встреча для команд заведений: короткие доклады, обмен контактами и разбор локальных задач индустрии.',
        startsAt: daysAgo(-14),
        endsAt: daysAgo(-14 - 0.125),
        locationName: 'BARSYNERGY Hub',
        address: 'Махачкала, проспект Петра I, 25',
        format: 'offline',
        capacity: 40,
        registrationMode: 'open',
        registrationUrl: 'https://barsynergy.example/events/demo-bar-community-meetup',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(1),
        categoryId: eventCategory.id,
        cityId: makhachkala.id,
        sortOrder: 1
      },
      create: {
        slug: 'demo-bar-community-meetup',
        title: 'Тестовое событие: встреча барного сообщества',
        summary: 'Открытая встреча для команд заведений: короткие доклады, обмен контактами и разбор локальных задач индустрии.',
        startsAt: daysAgo(-14),
        endsAt: daysAgo(-14 - 0.125),
        locationName: 'BARSYNERGY Hub',
        address: 'Махачкала, проспект Петра I, 25',
        format: 'offline',
        capacity: 40,
        registrationMode: 'open',
        registrationUrl: 'https://barsynergy.example/events/demo-bar-community-meetup',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(1),
        categoryId: eventCategory.id,
        cityId: makhachkala.id,
        sortOrder: 1
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
        contactTelegram: '@aster_hr_demo',
        contactPhone: '+7 962 120-44-10',
        description: [
          'Aster Roasters — кофейня в центре Махачкалы с упором на specialty-зерно собственного обжара. Ежедневный поток — около 120 чашек. Меню строится вокруг эспрессо-линейки и сезонного фильтра.',
          '## Что вы будете делать',
          'Работать на двухгруппной машине в утреннюю и дневную смены. Настраивать помол и экстракцию под каждую новую партию зерна. Стажировать новых сотрудников по стандартам приготовления. Участвовать в тестировании сезонных позиций меню. Вести кассу и работать с гостями напрямую.',
          '## Требования',
          'Уверенная работа на эспрессо-машине в потоке. Опыт настройки граиндера и экстракции — обязательно. Умение объяснить разницу между зерном без лишней теории. Готовность к обучению смены. Опыт от 1 года в specialty- или хорошей кофейне.',
          '## Условия',
          'Полная занятость, сменный график 5/2. Зарплата от 70 000 ₽ плюс бонус от выполнения плана. Стажировка 2 недели с наставником. Обеды внутри смены. Кофе и напитки — бесплатно.',
          '## Как откликнуться',
          'Напишите в Telegram или позвоните. Расскажите, где работали и с каким зерном знакомы. Можно прислать портфолио, если оно есть.'
        ].join('\n\n')
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
        contactTelegram: '@aster_hr_demo',
        contactPhone: '+7 962 120-44-10',
        description: [
          'Aster Roasters — кофейня в центре Махачкалы с упором на specialty-зерно собственного обжара. Ежедневный поток — около 120 чашек. Меню строится вокруг эспрессо-линейки и сезонного фильтра.',
          '## Что вы будете делать',
          'Работать на двухгруппной машине в утреннюю и дневную смены. Настраивать помол и экстракцию под каждую новую партию зерна. Стажировать новых сотрудников по стандартам приготовления. Участвовать в тестировании сезонных позиций меню. Вести кассу и работать с гостями напрямую.',
          '## Требования',
          'Уверенная работа на эспрессо-машине в потоке. Опыт настройки граиндера и экстракции — обязательно. Умение объяснить разницу между зерном без лишней теории. Готовность к обучению смены. Опыт от 1 года в specialty- или хорошей кофейне.',
          '## Условия',
          'Полная занятость, сменный график 5/2. Зарплата от 70 000 ₽ плюс бонус от выполнения плана. Стажировка 2 недели с наставником. Обеды внутри смены. Кофе и напитки — бесплатно.',
          '## Как откликнуться',
          'Напишите в Telegram или позвоните. Расскажите, где работали и с каким зерном знакомы. Можно прислать портфолио, если оно есть.'
        ].join('\n\n')
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
        salaryLabel: '85 000 – 110 000 ₽',
        experienceLabel: 'от 2 лет',
        contactMode: 'Email и Telegram',
        contactTelegram: '@atelier12_demo',
        contactEmail: 'hr@atelier12.example',
        description: [
          'Atelier 12 — вечерний бар в Каспийске с авторской коктейльной картой и фокусом на сервис. Открылись год назад, сейчас масштабируем команду и запускаем сезонное меню.',
          '## Что вы будете делать',
          'Управлять сменами и командой из 4–6 человек. Контролировать качество подачи и скорость сервиса в пиковые часы. Вести складской учёт бара: закупки, списания, инвентаризация. Участвовать в разработке и тестировании новых позиций меню. Обучать новых сотрудников стандартам заведения.',
          '## Требования',
          'Опыт управления барной сменой от 2 лет. Понимание коктейльной карты и работы с алкоголем. Умение выстраивать процессы и держать стандарты без постоянного контроля. Уверенная работа с кассой и учётными системами. Готовность к вечерним и ночным сменам.',
          '## Условия',
          'Сменный график, преимущественно вечер и ночь. Зарплата 85 000 – 110 000 ₽ в зависимости от опыта. Квартальный бонус при выполнении показателей. Корпоративное обучение и участие в дегустациях. Перспектива роста до управляющего при расширении сети.',
          '## Как откликнуться',
          'Напишите на email или в Telegram. Кратко расскажите про опыт управления и последнее место работы. Готовы ответить на вопросы перед встречей.'
        ].join('\n\n')
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
        salaryLabel: '85 000 – 110 000 ₽',
        experienceLabel: 'от 2 лет',
        contactMode: 'Email и Telegram',
        contactTelegram: '@atelier12_demo',
        contactEmail: 'hr@atelier12.example',
        description: [
          'Atelier 12 — вечерний бар в Каспийске с авторской коктейльной картой и фокусом на сервис. Открылись год назад, сейчас масштабируем команду и запускаем сезонное меню.',
          '## Что вы будете делать',
          'Управлять сменами и командой из 4–6 человек. Контролировать качество подачи и скорость сервиса в пиковые часы. Вести складской учёт бара: закупки, списания, инвентаризация. Участвовать в разработке и тестировании новых позиций меню. Обучать новых сотрудников стандартам заведения.',
          '## Требования',
          'Опыт управления барной сменой от 2 лет. Понимание коктейльной карты и работы с алкоголем. Умение выстраивать процессы и держать стандарты без постоянного контроля. Уверенная работа с кассой и учётными системами. Готовность к вечерним и ночным сменам.',
          '## Условия',
          'Сменный график, преимущественно вечер и ночь. Зарплата 85 000 – 110 000 ₽ в зависимости от опыта. Квартальный бонус при выполнении показателей. Корпоративное обучение и участие в дегустациях. Перспектива роста до управляющего при расширении сети.',
          '## Как откликнуться',
          'Напишите на email или в Telegram. Кратко расскажите про опыт управления и последнее место работы. Готовы ответить на вопросы перед встречей.'
        ].join('\n\n')
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
        summary: 'Поставки кофе, сиропов, молока, расходников и POS-материалов для заведений разного масштаба в Дагестане.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        archivedAt: null,
        cityId: makhachkala.id,
        categoryId: ingredientCategory.id,
        companyName: 'Aroma Trade South',
        websiteUrl: 'https://aroma-trade.example',
        contactLabel: 'sales@aroma-trade.example / +7 962 120-44-10',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент',
        description: [
          'Aroma Trade South работает с заведениями СКФО с 2019 года. Ассортимент охватывает кофейное зерно, молоко и альтернативное молоко, сиропы, расходники и POS-материалы. Поставляем напрямую от производителей и дистрибьюторов с договорами на хранение и логистику по региону.',
          '## Ассортимент',
          '**Кофейное зерно.** Несколько specialty-лотов и коммерческих блендов под эспрессо и фильтр. Ротация раз в 4–6 недель, образцы на дегустацию — по запросу.\n\n**Молочная линейка.** Пастеризованное и ультрапастеризованное молоко, овсяное и миндальное молоко от партнёрских брендов. Доставка в охлаждённом режиме.\n\n**Сиропы.** Постоянный склад: ваниль, карамель, лесной орех, кокос. Сезонные позиции под предзаказ за 2 недели.\n\n**Расходники.** Стаканы 250–500 мл, крышки, трубочки, холдеры, крафт-пакеты. Биоразлагаемая упаковка — под запрос.',
          '## Условия работы',
          'Минимальный заказ согласовывается по категории. Отсрочка платежа для постоянных клиентов — от 14 дней. Доставка по Махачкале: 1–2 рабочих дня. Каспийск и Дербент: 2–3 дня. Личный менеджер закреплён с первой поставки.',
          '## Как оформить запрос',
          'Опишите, что нужно и в каком объёме — менеджер ответит в течение рабочего дня. Можно сразу указать актуальные позиции и удобный формат доставки.'
        ].join('\n\n')
      },
      create: {
        slug: 'aroma-trade-south-demo',
        title: 'Кофе, сиропы и расходники для ежедневной работы',
        summary: 'Поставки кофе, сиропов, молока, расходников и POS-материалов для заведений разного масштаба в Дагестане.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        cityId: makhachkala.id,
        categoryId: ingredientCategory.id,
        companyName: 'Aroma Trade South',
        websiteUrl: 'https://aroma-trade.example',
        contactLabel: 'sales@aroma-trade.example / +7 962 120-44-10',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент',
        description: [
          'Aroma Trade South работает с заведениями СКФО с 2019 года. Ассортимент охватывает кофейное зерно, молоко и альтернативное молоко, сиропы, расходники и POS-материалы. Поставляем напрямую от производителей и дистрибьюторов с договорами на хранение и логистику по региону.',
          '## Ассортимент',
          '**Кофейное зерно.** Несколько specialty-лотов и коммерческих блендов под эспрессо и фильтр. Ротация раз в 4–6 недель, образцы на дегустацию — по запросу.\n\n**Молочная линейка.** Пастеризованное и ультрапастеризованное молоко, овсяное и миндальное молоко от партнёрских брендов. Доставка в охлаждённом режиме.\n\n**Сиропы.** Постоянный склад: ваниль, карамель, лесной орех, кокос. Сезонные позиции под предзаказ за 2 недели.\n\n**Расходники.** Стаканы 250–500 мл, крышки, трубочки, холдеры, крафт-пакеты. Биоразлагаемая упаковка — под запрос.',
          '## Условия работы',
          'Минимальный заказ согласовывается по категории. Отсрочка платежа для постоянных клиентов — от 14 дней. Доставка по Махачкале: 1–2 рабочих дня. Каспийск и Дербент: 2–3 дня. Личный менеджер закреплён с первой поставки.',
          '## Как оформить запрос',
          'Опишите, что нужно и в каком объёме — менеджер ответит в течение рабочего дня. Можно сразу указать актуальные позиции и удобный формат доставки.'
        ].join('\n\n')
      }
    }),
    prisma.supplier.upsert({
      where: { slug: 'linea-service-equipment-demo' },
      update: {
        title: 'Барное оборудование и ледогенераторы под запуск',
        summary: 'Оснащение новых точек, подбор и поставка оборудования, монтаж и сервисное сопровождение после запуска.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        archivedAt: null,
        cityId: kaspiysk.id,
        categoryId: equipmentCategory.id,
        companyName: 'Linea Service',
        websiteUrl: 'https://linea-service.example',
        contactLabel: '@linea_service / +7 928 145-45-10',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала и ближайшие районы',
        description: [
          'Linea Service — поставщик и сервисный партнёр для кофеен и баров в Дагестане. Работаем с профессиональным оборудованием: эспрессо-машины, граиндеры, ледогенераторы, холодильные и барные станции. Не просто поставляем — помогаем выбрать, установить, запустить и обслужить.',
          '## Что мы поставляем',
          '**Эспрессо-машины.** Одно- и двухгруппные модели от проверенных производителей. Подбор под поток, формат и бюджет заведения. Демонстрация работы перед покупкой — по запросу.\n\n**Граиндеры.** Граиндеры на дозатор и on-demand для эспрессо и фильтра. Настройка под конкретное зерно при поставке.\n\n**Ледогенераторы.** Кубиковый, пальчиковый и чешуйчатый лёд. Подбор мощности под объём бара.\n\n**Барные станции и холодильники.** Встраиваемое и напольное оборудование. Расчёт размещения на плане бара — бесплатно при заказе.',
          '## Сервис и обслуживание',
          'Гарантийный ремонт в рамках договора. Плановое ТО раз в 3–6 месяцев. Замена расходников и прокладок: выезд в течение 1–2 рабочих дней. Обучение бариста работе с оборудованием при запуске.',
          '## Условия',
          'Работаем по договору поставки или договору аренды оборудования. Возможна рассрочка на крупные позиции. Монтаж и первичная настройка — включены в стоимость поставки.',
          '## Как оформить запрос',
          'Опишите, какое оборудование нужно и в каком формате (поставка или аренда). Если делаете запуск с нуля — укажите площадь бара и ожидаемый поток: подготовим предложение под ключ.'
        ].join('\n\n')
      },
      create: {
        slug: 'linea-service-equipment-demo',
        title: 'Барное оборудование и ледогенераторы под запуск',
        summary: 'Оснащение новых точек, подбор и поставка оборудования, монтаж и сервисное сопровождение после запуска.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        cityId: kaspiysk.id,
        categoryId: equipmentCategory.id,
        companyName: 'Linea Service',
        websiteUrl: 'https://linea-service.example',
        contactLabel: '@linea_service / +7 928 145-45-10',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала и ближайшие районы',
        description: [
          'Linea Service — поставщик и сервисный партнёр для кофеен и баров в Дагестане. Работаем с профессиональным оборудованием: эспрессо-машины, граиндеры, ледогенераторы, холодильные и барные станции. Не просто поставляем — помогаем выбрать, установить, запустить и обслужить.',
          '## Что мы поставляем',
          '**Эспрессо-машины.** Одно- и двухгруппные модели от проверенных производителей. Подбор под поток, формат и бюджет заведения. Демонстрация работы перед покупкой — по запросу.\n\n**Граиндеры.** Граиндеры на дозатор и on-demand для эспрессо и фильтра. Настройка под конкретное зерно при поставке.\n\n**Ледогенераторы.** Кубиковый, пальчиковый и чешуйчатый лёд. Подбор мощности под объём бара.\n\n**Барные станции и холодильники.** Встраиваемое и напольное оборудование. Расчёт размещения на плане бара — бесплатно при заказе.',
          '## Сервис и обслуживание',
          'Гарантийный ремонт в рамках договора. Плановое ТО раз в 3–6 месяцев. Замена расходников и прокладок: выезд в течение 1–2 рабочих дней. Обучение бариста работе с оборудованием при запуске.',
          '## Условия',
          'Работаем по договору поставки или договору аренды оборудования. Возможна рассрочка на крупные позиции. Монтаж и первичная настройка — включены в стоимость поставки.',
          '## Как оформить запрос',
          'Опишите, какое оборудование нужно и в каком формате (поставка или аренда). Если делаете запуск с нуля — укажите площадь бара и ожидаемый поток: подготовим предложение под ключ.'
        ].join('\n\n')
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

  const [masterOne, masterTwo] = await Promise.all([
    prisma.master.upsert({
      where: { slug: 'amina-service-lab-demo' },
      update: {
        title: 'Амина Расулова — запуск бара и сервис',
        summary: 'Помогает заведениям настроить барную станцию, карту напитков и базовый сервис команды перед открытием.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        archivedAt: null,
        cityId: makhachkala.id,
        categoryId: masterConsultingCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Амина Расулова',
        companyName: null,
        description: [
          'Работаю с барами, кофейнями и ресторанами на этапе запуска или перезапуска. Помогаю собрать рабочую станцию, описать процессы смены, настроить гостевой сценарий и подготовить команду к первым неделям работы.',
          '## Что делаю',
          'Аудит барной зоны, базовая карта напитков, чек-листы открытия и закрытия смены, обучение команды простому и стабильному сервису.',
          '## Формат',
          'Выезд в заведение, короткий разбор онлайн или сопровождение запуска в течение нескольких смен.'
        ].join('\n\n'),
        contactLabel: '@amina_service_lab',
        contactTelegram: '@amina_service_lab',
        contactPhone: '+7 928 610-14-20',
        contactEmail: 'amina.master@example.com',
        specializations: ['bar-setup', 'team-training', 'service-audit'],
        experienceYears: 8,
        rateLabel: 'От 15 000 ₽ за выезд',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент'
      },
      create: {
        slug: 'amina-service-lab-demo',
        title: 'Амина Расулова — запуск бара и сервис',
        summary: 'Помогает заведениям настроить барную станцию, карту напитков и базовый сервис команды перед открытием.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(2),
        cityId: makhachkala.id,
        categoryId: masterConsultingCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Амина Расулова',
        description: [
          'Работаю с барами, кофейнями и ресторанами на этапе запуска или перезапуска. Помогаю собрать рабочую станцию, описать процессы смены, настроить гостевой сценарий и подготовить команду к первым неделям работы.',
          '## Что делаю',
          'Аудит барной зоны, базовая карта напитков, чек-листы открытия и закрытия смены, обучение команды простому и стабильному сервису.',
          '## Формат',
          'Выезд в заведение, короткий разбор онлайн или сопровождение запуска в течение нескольких смен.'
        ].join('\n\n'),
        contactLabel: '@amina_service_lab',
        contactTelegram: '@amina_service_lab',
        contactPhone: '+7 928 610-14-20',
        contactEmail: 'amina.master@example.com',
        specializations: ['bar-setup', 'team-training', 'service-audit'],
        experienceYears: 8,
        rateLabel: 'От 15 000 ₽ за выезд',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент'
      }
    }),
    prisma.master.upsert({
      where: { slug: 'linea-service-equipment-master-demo' },
      update: {
        title: 'Linea Service — сервис кофейного оборудования',
        summary: 'Бизнес-команда для подбора, установки и регулярного обслуживания кофейного и барного оборудования.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        archivedAt: null,
        cityId: kaspiysk.id,
        categoryId: masterTechnicalCategory.id,
        businessAccountId: lineaBusiness.id,
        entityType: MasterEntityType.BUSINESS,
        fullName: null,
        companyName: 'Linea Service',
        description: [
          'Команда Linea Service помогает кофейням и барам запускать оборудование без лишнего простоя: подбираем модель под поток, ставим на место, настраиваем и берём на регулярное обслуживание.',
          '## Услуги',
          'Диагностика эспрессо-машин, настройка кофемолок, плановое ТО, запуск оборудования после покупки, консультация по размещению станции.',
          '## География',
          'Работаем по Каспийску и Махачкале, выезд в соседние города обсуждается отдельно.'
        ].join('\n\n'),
        contactLabel: '@linea_service / +7 928 145-45-10',
        contactTelegram: '@linea_service',
        contactPhone: '+7 928 145-45-10',
        contactEmail: 'service@linea-service.example',
        specializations: ['equipment-service', 'coffee-machine-setup', 'preventive-maintenance'],
        experienceYears: 6,
        rateLabel: 'Диагностика от 5 000 ₽',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала и ближайшие районы'
      },
      create: {
        slug: 'linea-service-equipment-master-demo',
        title: 'Linea Service — сервис кофейного оборудования',
        summary: 'Бизнес-команда для подбора, установки и регулярного обслуживания кофейного и барного оборудования.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        cityId: kaspiysk.id,
        categoryId: masterTechnicalCategory.id,
        businessAccountId: lineaBusiness.id,
        entityType: MasterEntityType.BUSINESS,
        companyName: 'Linea Service',
        description: [
          'Команда Linea Service помогает кофейням и барам запускать оборудование без лишнего простоя: подбираем модель под поток, ставим на место, настраиваем и берём на регулярное обслуживание.',
          '## Услуги',
          'Диагностика эспрессо-машин, настройка кофемолок, плановое ТО, запуск оборудования после покупки, консультация по размещению станции.',
          '## География',
          'Работаем по Каспийску и Махачкале, выезд в соседние города обсуждается отдельно.'
        ].join('\n\n'),
        contactLabel: '@linea_service / +7 928 145-45-10',
        contactTelegram: '@linea_service',
        contactPhone: '+7 928 145-45-10',
        contactEmail: 'service@linea-service.example',
        specializations: ['equipment-service', 'coffee-machine-setup', 'preventive-maintenance'],
        experienceYears: 6,
        rateLabel: 'Диагностика от 5 000 ₽',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала и ближайшие районы'
      }
    })
  ]);

  const [masterThree, masterFour, masterFive, masterSix, masterSeven, amirProfile, elenaProfile, nikitaProfile] = await Promise.all([
    prisma.master.upsert({
      where: { slug: 'timur-cocktail-consultant-demo' },
      update: {
        title: 'Тимур Керимов — коктейльный консультант',
        summary: 'Разработка коктейльных карт, обучение барменов, аудит бара и подбор оборудования для вечерних проектов.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(4),
        archivedAt: null,
        cityId: kaspiysk.id,
        categoryId: masterConsultingCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Тимур Керимов',
        companyName: null,
        description: [
          'Работаю с барами и ресторанами, которым нужна сильная коктейльная карта и стабильный сервис в вечерние часы. Помогаю собрать меню, подобрать оборудование, обучить команду и выстроить процессы закупки.',
          '## Услуги',
          'Разработка коктейльной карты под концепцию заведения. Аудит бара: ассортимент, оборудование, себестоимость позиций. Обучение команды: техника приготовления, презентация, работа с гостем в вечернем формате. Подбор стекла, льда и расходников.',
          '## Формат',
          'Выезд в заведение, онлайн-консультация или полное сопровождение в течение месяца после запуска.'
        ].join('\n\n'),
        contactLabel: '@timur_cocktail',
        contactTelegram: '@timur_cocktail',
        contactPhone: '+7 928 700-31-40',
        contactEmail: 'timur.master@example.com',
        specializations: ['bar-setup', 'menu-development', 'team-training'],
        experienceYears: 10,
        rateLabel: 'От 20 000 ₽ за проект',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала, Дербент'
      },
      create: {
        slug: 'timur-cocktail-consultant-demo',
        title: 'Тимур Керимов — коктейльный консультант',
        summary: 'Разработка коктейльных карт, обучение барменов, аудит бара и подбор оборудования для вечерних проектов.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(4),
        cityId: kaspiysk.id,
        categoryId: masterConsultingCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Тимур Керимов',
        description: [
          'Работаю с барами и ресторанами, которым нужна сильная коктейльная карта и стабильный сервис в вечерние часы. Помогаю собрать меню, подобрать оборудование, обучить команду и выстроить процессы закупки.',
          '## Услуги',
          'Разработка коктейльной карты под концепцию заведения. Аудит бара: ассортимент, оборудование, себестоимость позиций. Обучение команды: техника приготовления, презентация, работа с гостем в вечернем формате. Подбор стекла, льда и расходников.',
          '## Формат',
          'Выезд в заведение, онлайн-консультация или полное сопровождение в течение месяца после запуска.'
        ].join('\n\n'),
        contactLabel: '@timur_cocktail',
        contactTelegram: '@timur_cocktail',
        contactPhone: '+7 928 700-31-40',
        contactEmail: 'timur.master@example.com',
        specializations: ['bar-setup', 'menu-development', 'team-training'],
        experienceYears: 10,
        rateLabel: 'От 20 000 ₽ за проект',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала, Дербент'
      }
    }),
    prisma.master.upsert({
      where: { slug: 'elena-coffee-trainer-demo' },
      update: {
        title: 'Елена Попова — обучение и сервис кофейного оборудования',
        summary: 'Коуч-бариста с фокусом на экстракцию, грайндеры и стабильность вкуса для кофеен, переходящих на specialty.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        archivedAt: null,
        cityId: derbent.id,
        categoryId: masterTechnicalCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Елена Попова',
        companyName: null,
        description: [
          'Помогаю кофейням настраивать экстракцию, выбирать грайндеры и обучать команду так, чтобы вкус был стабильным от смены к смене.',
          '## Услуги',
          'Настройка помола и экстракции для нового зерна. Обучение команды: латте-арт, калибровка грайндера, сенсорика. Аудит кофейной станции: оборудование, вода, workflow. Помощь в выборе оборудования при переходе на specialty.',
          '## Формат',
          'Выезд в кофейню на 1–3 дня, онлайн-сопровождение после визита.'
        ].join('\n\n'),
        contactLabel: '@elena_coffee_trainer',
        contactTelegram: '@elena_coffee_trainer',
        contactPhone: '+7 928 811-25-60',
        contactEmail: 'elena.master@example.com',
        specializations: ['equipment-service', 'coffee-training', 'bar-setup'],
        experienceYears: 5,
        rateLabel: 'От 10 000 ₽ за выездной день',
        isVerified: true,
        serviceArea: 'Дербент, Махачкала'
      },
      create: {
        slug: 'elena-coffee-trainer-demo',
        title: 'Елена Попова — обучение и сервис кофейного оборудования',
        summary: 'Коуч-бариста с фокусом на экстракцию, грайндеры и стабильность вкуса для кофеен, переходящих на specialty.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(5),
        cityId: derbent.id,
        categoryId: masterTechnicalCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Елена Попова',
        description: [
          'Помогаю кофейням настраивать экстракцию, выбирать грайндеры и обучать команду так, чтобы вкус был стабильным от смены к смене.',
          '## Услуги',
          'Настройка помола и экстракции для нового зерна. Обучение команды: латте-арт, калибровка грайндера, сенсорика. Аудит кофейной станции: оборудование, вода, workflow. Помощь в выборе оборудования при переходе на specialty.',
          '## Формат',
          'Выезд в кофейню на 1–3 дня, онлайн-сопровождение после визита.'
        ].join('\n\n'),
        contactLabel: '@elena_coffee_trainer',
        contactTelegram: '@elena_coffee_trainer',
        contactPhone: '+7 928 811-25-60',
        contactEmail: 'elena.master@example.com',
        specializations: ['equipment-service', 'coffee-training', 'bar-setup'],
        experienceYears: 5,
        rateLabel: 'От 10 000 ₽ за выездной день',
        isVerified: true,
        serviceArea: 'Дербент, Махачкала'
      }
    }),
    prisma.master.upsert({
      where: { slug: 'ibragim-bar-consultant-demo' },
      update: {
        title: 'Ибрагим Магомедов — шеф-бармен и запуск проектов',
        summary: 'Полное сопровождение бара от концепции до открытия: меню, оборудование, команда, себестоимость.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        archivedAt: null,
        cityId: makhachkala.id,
        categoryId: masterConsultingCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Ибрагим Магомедов',
        companyName: null,
        description: [
          'С 2014 года работаю в барной индустрии: от линейного бармена до управляющего сетью. Сейчас сопровождаю запуски и помогаю заведениям выходить на операционную стабильность.',
          '## Услуги',
          'Полный запуск бара: концепция, оборудование, планировка, меню. Аудит себестоимости и поиск точек роста. Сборка и обучение команды под формат заведения. Операционное сопровождение первые 2–3 месяца работы.',
          '## Формат',
          'Выездной или гибридный — под ключ для запусков и точечный аудит для работающих заведений.'
        ].join('\n\n'),
        contactLabel: '@ibragim_bar',
        contactTelegram: '@ibragim_bar',
        contactPhone: '+7 928 922-37-80',
        contactEmail: 'ibragim.master@example.com',
        specializations: ['bar-setup', 'team-training', 'service-audit'],
        experienceYears: 12,
        rateLabel: 'По запросу',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент и СКФО'
      },
      create: {
        slug: 'ibragim-bar-consultant-demo',
        title: 'Ибрагим Магомедов — шеф-бармен и запуск проектов',
        summary: 'Полное сопровождение бара от концепции до открытия: меню, оборудование, команда, себестоимость.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(6),
        cityId: makhachkala.id,
        categoryId: masterConsultingCategory.id,
        entityType: MasterEntityType.INDIVIDUAL,
        fullName: 'Ибрагим Магомедов',
        description: [
          'С 2014 года работаю в барной индустрии: от линейного бармена до управляющего сетью. Сейчас сопровождаю запуски и помогаю заведениям выходить на операционную стабильность.',
          '## Услуги',
          'Полный запуск бара: концепция, оборудование, планировка, меню. Аудит себестоимости и поиск точек роста. Сборка и обучение команды под формат заведения. Операционное сопровождение первые 2–3 месяца работы.',
          '## Формат',
          'Выездной или гибридный — под ключ для запусков и точечный аудит для работающих заведений.'
        ].join('\n\n'),
        contactLabel: '@ibragim_bar',
        contactTelegram: '@ibragim_bar',
        contactPhone: '+7 928 922-37-80',
        contactEmail: 'ibragim.master@example.com',
        specializations: ['bar-setup', 'team-training', 'service-audit'],
        experienceYears: 12,
        rateLabel: 'По запросу',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, Дербент и СКФО'
      }
    }),
    prisma.master.upsert({
      where: { slug: 'aster-training-master-demo' },
      update: {
        title: 'Aster Roasters — обучение и консалтинг для кофеен',
        summary: 'Корпоративное обучение команд, настройка эспрессо-линейки, калибровка оборудования для заведений любого формата.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(7),
        archivedAt: null,
        cityId: makhachkala.id,
        categoryId: masterTechnicalCategory.id,
        entityType: MasterEntityType.BUSINESS,
        fullName: null,
        companyName: 'Aster Roasters',
        description: [
          'Обучаем команды кофеен и баров работе со спешелти-зерном: от теории обжарки до ежедневной калибровки грайндера. Работаем с заведениями любого масштаба.',
          '## Услуги',
          'Корпоративное обучение: от вводного курса для новичков до продвинутого сенсорного тренинга. Аудит эспрессо-линейки: настройка помола, экстракции, температуры воды. Помощь в выборе зерна и создании сезонного меню.',
          '## География',
          'Махачкала, Каспийск, выезд по СКФО.'
        ].join('\n\n'),
        contactLabel: '@aster_training',
        contactTelegram: '@aster_training',
        contactPhone: '+7 962 120-44-11',
        contactEmail: 'training@aster-roasters.example',
        specializations: ['coffee-training', 'equipment-service', 'bar-setup'],
        experienceYears: 4,
        rateLabel: 'От 25 000 ₽ за выездное обучение',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, СКФО'
      },
      create: {
        slug: 'aster-training-master-demo',
        title: 'Aster Roasters — обучение и консалтинг для кофеен',
        summary: 'Корпоративное обучение команд, настройка эспрессо-линейки, калибровка оборудования для заведений любого формата.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(7),
        cityId: makhachkala.id,
        categoryId: masterTechnicalCategory.id,
        entityType: MasterEntityType.BUSINESS,
        companyName: 'Aster Roasters',
        description: [
          'Обучаем команды кофеен и баров работе со спешелти-зерном: от теории обжарки до ежедневной калибровки грайндера. Работаем с заведениями любого масштаба.',
          '## Услуги',
          'Корпоративное обучение: от вводного курса для новичков до продвинутого сенсорного тренинга. Аудит эспрессо-линейки: настройка помола, экстракции, температуры воды. Помощь в выборе зерна и создании сезонного меню.',
          '## География',
          'Махачкала, Каспийск, выезд по СКФО.'
        ].join('\n\n'),
        contactLabel: '@aster_training',
        contactTelegram: '@aster_training',
        contactPhone: '+7 962 120-44-11',
        contactEmail: 'training@aster-roasters.example',
        specializations: ['coffee-training', 'equipment-service', 'bar-setup'],
        experienceYears: 4,
        rateLabel: 'От 25 000 ₽ за выездное обучение',
        isVerified: true,
        serviceArea: 'Махачкала, Каспийск, СКФО'
      }
    }),
    prisma.master.upsert({
      where: { slug: 'atelier-launch-consulting-demo' },
      update: {
        title: 'Atelier 12 — консалтинг по запуску баров и ресторанов',
        summary: 'Команда Atelier 12 помогает новым проектам пройти путь от концепции до открытия: планировка, меню, подбор команды.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        archivedAt: null,
        cityId: kaspiysk.id,
        categoryId: masterConsultingCategory.id,
        businessAccountId: atelierBusiness.id,
        entityType: MasterEntityType.BUSINESS,
        fullName: null,
        companyName: 'Atelier 12',
        description: [
          'Мы в Atelier 12 прошли собственный путь запуска и теперь помогаем другим проектам не повторять типичные ошибки. Консультируем по планировке, оборудованию, меню и операционным процессам.',
          '## Услуги',
          'Консалтинг на этапе планирования: формат, локация, бюджет. Разработка меню и технологических карт. Помощь в подборе и обучении команды. Операционный аудит после запуска: что улучшить в первые месяцы.',
          '## География',
          'Каспийск, Махачкала, онлайн по запросу.'
        ].join('\n\n'),
        contactLabel: '@atelier12_consult',
        contactTelegram: '@atelier12_consult',
        contactPhone: '+7 962 401-12-13',
        contactEmail: 'consult@atelier12.example',
        specializations: ['bar-setup', 'menu-development', 'service-audit'],
        experienceYears: 3,
        rateLabel: 'От 30 000 ₽ за консультацию',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала'
      },
      create: {
        slug: 'atelier-launch-consulting-demo',
        title: 'Atelier 12 — консалтинг по запуску баров и ресторанов',
        summary: 'Команда Atelier 12 помогает новым проектам пройти путь от концепции до открытия: планировка, меню, подбор команды.',
        status: ContentStatus.PUBLISHED,
        publishedAt: daysAgo(3),
        cityId: kaspiysk.id,
        categoryId: masterConsultingCategory.id,
        businessAccountId: atelierBusiness.id,
        entityType: MasterEntityType.BUSINESS,
        companyName: 'Atelier 12',
        description: [
          'Мы в Atelier 12 прошли собственный путь запуска и теперь помогаем другим проектам не повторять типичные ошибки. Консультируем по планировке, оборудованию, меню и операционным процессам.',
          '## Услуги',
          'Консалтинг на этапе планирования: формат, локация, бюджет. Разработка меню и технологических карт. Помощь в подборе и обучении команды. Операционный аудит после запуска: что улучшить в первые месяцы.',
          '## География',
          'Каспийск, Махачкала, онлайн по запросу.'
        ].join('\n\n'),
        contactLabel: '@atelier12_consult',
        contactTelegram: '@atelier12_consult',
        contactPhone: '+7 962 401-12-13',
        contactEmail: 'consult@atelier12.example',
        specializations: ['bar-setup', 'menu-development', 'service-audit'],
        experienceYears: 3,
        rateLabel: 'От 30 000 ₽ за консультацию',
        isVerified: true,
        serviceArea: 'Каспийск, Махачкала'
      }
    }),
    prisma.profile.upsert({
      where: { userId: amirUser.id },
      update: {
        fullName: 'Амир Омаров',
        profession: 'Бармен-универсал',
        cityId: makhachkala.id,
        headline: 'Работаю в форматах от классического бара до спешелти-кофейни',
        bio: 'Опыт более 6 лет: начинал в сетевой кофейне, дорос до бар-менеджера вечернего проекта. Работал с разными форматами — от high-volume кофейни до авторского коктейльного бара. Ищу проект, где смогу совмещать управление сменой и работу за баром.',
        phone: '+7 928 500-11-22',
        telegram: '@amir_omarov',
        skills: ['Барное дело', 'Кофе', 'Коктейли', 'Управление сменой', 'Работа с кассой'],
        jobSearchStatus: JobSearchStatus.ACTIVE,
        desiredSalary: 85000,
        employmentTypes: [EmploymentType.FULL_TIME],
        isPublic: true,
        publicHandle: 'amir-omarov',
        publishedAt: daysAgo(1)
      },
      create: {
        userId: amirUser.id,
        fullName: 'Амир Омаров',
        profession: 'Бармен-универсал',
        cityId: makhachkala.id,
        headline: 'Работаю в форматах от классического бара до спешелти-кофейни',
        bio: 'Опыт более 6 лет: начинал в сетевой кофейне, дорос до бар-менеджера вечернего проекта. Работал с разными форматами — от high-volume кофейни до авторского коктейльного бара. Ищу проект, где смогу совмещать управление сменой и работу за баром.',
        phone: '+7 928 500-11-22',
        telegram: '@amir_omarov',
        skills: ['Барное дело', 'Кофе', 'Коктейли', 'Управление сменой', 'Работа с кассой'],
        jobSearchStatus: JobSearchStatus.ACTIVE,
        desiredSalary: 85000,
        employmentTypes: [EmploymentType.FULL_TIME],
        isPublic: true,
        publicHandle: 'amir-omarov',
        publishedAt: daysAgo(1)
      }
    }),
    prisma.profile.upsert({
      where: { userId: elenaUser.id },
      update: {
        fullName: 'Елена Соколова',
        profession: 'Бариста',
        cityId: kaspiysk.id,
        headline: 'Specialty-бариста с опытом работы в высоком потоке',
        bio: 'Три года работаю в спешелти-кофейне с потоком до 150 чашек в день. Настраиваю экстракцию, обучаю стажёров, веду гостевую зону. Участвовала в двух региональных каппинг-чемпионатах.',
        phone: '+7 928 733-44-55',
        telegram: '@elena_sokolova',
        skills: ['Эспрессо', 'Латте-арт', 'Фильтр-кофе', 'Сенсорика', 'Работа с гостем'],
        jobSearchStatus: JobSearchStatus.ACTIVE,
        desiredSalary: 65000,
        desiredSalaryMax: 80000,
        employmentTypes: [EmploymentType.FULL_TIME, EmploymentType.PART_TIME],
        isPublic: true,
        publicHandle: 'elena-sokolova',
        publishedAt: daysAgo(2)
      },
      create: {
        userId: elenaUser.id,
        fullName: 'Елена Соколова',
        profession: 'Бариста',
        cityId: kaspiysk.id,
        headline: 'Specialty-бариста с опытом работы в высоком потоке',
        bio: 'Три года работаю в спешелти-кофейне с потоком до 150 чашек в день. Настраиваю экстракцию, обучаю стажёров, веду гостевую зону. Участвовала в двух региональных каппинг-чемпионатах.',
        phone: '+7 928 733-44-55',
        telegram: '@elena_sokolova',
        skills: ['Эспрессо', 'Латте-арт', 'Фильтр-кофе', 'Сенсорика', 'Работа с гостем'],
        jobSearchStatus: JobSearchStatus.ACTIVE,
        desiredSalary: 65000,
        desiredSalaryMax: 80000,
        employmentTypes: [EmploymentType.FULL_TIME, EmploymentType.PART_TIME],
        isPublic: true,
        publicHandle: 'elena-sokolova',
        publishedAt: daysAgo(2)
      }
    }),
    prisma.profile.upsert({
      where: { userId: nikitaUser.id },
      update: {
        fullName: 'Никита Власов',
        profession: 'Шеф-бармен / Управляющий',
        cityId: derbent.id,
        headline: 'Управляю барной сменой и разрабатываю коктейльные карты',
        bio: 'Управляющий с опытом запуска двух баров. Составляю команду, разрабатываю меню, контролирую себестоимость и качество сервиса. Ищу проект в Дагестане с возможностью участвовать в развитии заведения.',
        phone: '+7 928 611-88-99',
        telegram: '@nikita_vlasov',
        skills: ['Управление командой', 'Коктейльная карта', 'Себестоимость', 'Запуск проектов', 'Барное оборудование'],
        jobSearchStatus: JobSearchStatus.ACTIVE,
        desiredSalary: 100000,
        desiredSalaryMax: 130000,
        employmentTypes: [EmploymentType.FULL_TIME],
        isPublic: true,
        publicHandle: 'nikita-vlasov',
        publishedAt: daysAgo(3)
      },
      create: {
        userId: nikitaUser.id,
        fullName: 'Никита Власов',
        profession: 'Шеф-бармен / Управляющий',
        cityId: derbent.id,
        headline: 'Управляю барной сменой и разрабатываю коктейльные карты',
        bio: 'Управляющий с опытом запуска двух баров. Составляю команду, разрабатываю меню, контролирую себестоимость и качество сервиса. Ищу проект в Дагестане с возможностью участвовать в развитии заведения.',
        phone: '+7 928 611-88-99',
        telegram: '@nikita_vlasov',
        skills: ['Управление командой', 'Коктейльная карта', 'Себестоимость', 'Запуск проектов', 'Барное оборудование'],
        jobSearchStatus: JobSearchStatus.ACTIVE,
        desiredSalary: 100000,
        desiredSalaryMax: 130000,
        employmentTypes: [EmploymentType.FULL_TIME],
        isPublic: true,
        publicHandle: 'nikita-vlasov',
        publishedAt: daysAgo(3)
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
  console.log(`Masters: ${masterOne.title}, ${masterTwo.title}, ${masterThree.title}, ${masterFour.title}, ${masterFive.title}, ${masterSix.title}, ${masterSeven.title}`);
  console.log(`Public profiles: ${amirProfile.fullName}, ${elenaProfile.fullName}, ${nikitaProfile.fullName}`);
  console.log(`Published test articles: ${starterArticles.map((article) => article.slug).join(', ')}`);
  console.log(`New editorial articles: ${newArticles.map((article) => article.slug).join(', ')}`);
  console.log(`Draft content: ${articleOne.slug}, ${articleTwo.slug}, ${eventOne.slug}, ${eventTwo.slug}`);
  console.log(`Published demo education/event: ${courseOne.slug}, ${eventThree.slug}`);
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
