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
