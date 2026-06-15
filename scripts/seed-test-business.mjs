import { URL } from 'node:url';
import bcrypt from 'bcryptjs';
import {
  BusinessAccountStatus,
  ContentStatus,
  PrismaClient,
  UserRole,
  UserStatus
} from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error']
});

const DEFAULT_EMAIL = 'coffee.point@barsynergy.local';
const DEFAULT_PASSWORD = 'CoffeePoint2026!';
const COMPANY_NAME = 'Coffee Point';
const COMPANY_SLUG = 'coffee-point';
const CITY_NAME = 'Москва';
const CITY_SLUG = 'moscow';
const VACANCY_TITLE = 'Бариста в утреннюю смену — Coffee Point';
const VACANCY_SLUG = 'coffee-point-barista-morning';
const SALT_ROUNDS = 12;
const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);

function ensureLocalDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing. Load the local .env before running the script.');
  }
  const parsed = new URL(databaseUrl);
  if (!LOCAL_DATABASE_HOSTS.has(parsed.hostname)) {
    throw new Error(`Refusing to run against non-local database host "${parsed.hostname}".`);
  }
}

function getArg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  return idx === -1 ? fallback : process.argv[idx + 1] ?? fallback;
}

async function ensureCity() {
  const existing = await prisma.city.findUnique({ where: { slug: CITY_SLUG } });
  if (existing) return existing;
  return prisma.city.create({
    data: { name: CITY_NAME, slug: CITY_SLUG, isActive: true, sortOrder: 0 }
  });
}

async function ensureVacancyCategory() {
  const existing = await prisma.category.findFirst({
    where: { slug: 'service-bar', type: 'VACANCY' }
  });
  if (existing) return existing;
  return prisma.category.create({
    data: {
      name: 'Бар и сервис',
      slug: 'service-bar',
      type: 'VACANCY',
      description: 'Линейные роли бара, сервиса и заведения',
      isActive: true,
      sortOrder: 10
    }
  });
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run with NODE_ENV=production.');
  }
  ensureLocalDatabaseUrl(process.env.DATABASE_URL);

  const email = (getArg('--email') ?? DEFAULT_EMAIL).trim().toLowerCase();
  const password = getArg('--password') ?? DEFAULT_PASSWORD;

  const city = await ensureCity();
  const category = await ensureVacancyCategory();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.BUSINESS,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date()
    },
    create: {
      email,
      passwordHash,
      role: UserRole.BUSINESS,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date()
    }
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      fullName: 'Анна Петрова',
      profession: 'Управляющая Coffee Point',
      company: COMPANY_NAME,
      cityId: city.id,
      isPublic: false
    },
    create: {
      userId: user.id,
      fullName: 'Анна Петрова',
      profession: 'Управляющая Coffee Point',
      company: COMPANY_NAME,
      cityId: city.id,
      isPublic: false
    }
  });

  const business = await prisma.businessAccount.upsert({
    where: { ownerId: user.id },
    update: {
      companyName: COMPANY_NAME,
      slug: COMPANY_SLUG,
      status: BusinessAccountStatus.ACTIVE,
      cityId: city.id,
      contactPerson: 'Анна Петрова',
      phone: '+7 (495) 000-12-34',
      telegram: '@coffeepoint_team',
      websiteUrl: 'https://coffeepoint.example',
      description:
        'Сеть из трёх кофеен в центре Москвы. Спешелти-кофе, локальная обжарка, дневная выручка ≈ 80–120 чеков на точку.'
    },
    create: {
      ownerId: user.id,
      companyName: COMPANY_NAME,
      slug: COMPANY_SLUG,
      status: BusinessAccountStatus.ACTIVE,
      cityId: city.id,
      contactPerson: 'Анна Петрова',
      phone: '+7 (495) 000-12-34',
      telegram: '@coffeepoint_team',
      websiteUrl: 'https://coffeepoint.example',
      description:
        'Сеть из трёх кофеен в центре Москвы. Спешелти-кофе, локальная обжарка, дневная выручка ≈ 80–120 чеков на точку.'
    }
  });

  const now = new Date();

  const vacancy = await prisma.vacancy.upsert({
    where: { slug: VACANCY_SLUG },
    update: {
      title: VACANCY_TITLE,
      summary: 'Утренние смены с 7:00, работа на эспрессо-машине La Marzocco Linea PB, дружная команда из трёх бариста.',
      status: ContentStatus.PUBLISHED,
      cityId: city.id,
      categoryId: category.id,
      businessAccountId: business.id,
      sortOrder: 0,
      publishedAt: now,
      companyName: COMPANY_NAME,
      position: 'Бариста',
      employmentType: 'full_time',
      salaryLabel: 'от 75 000 ₽ + бонусы',
      experienceLabel: 'От 1 года в спешелти',
      contactMode: 'telegram',
      contactTelegram: '@coffeepoint_hr',
      contactPhone: '+7 (495) 000-12-34',
      contactEmail: email,
      description: [
        '## Кого ищем',
        'Бариста на утреннюю смену (7:00–15:00, 5/2) в точку Coffee Point на Большой Никитской. Работаем на спешелти-зёрнах локальной обжарки, V60, AeroPress, эспрессо-машина La Marzocco Linea PB.',
        '',
        '## Что важно',
        '- Опыт от 1 года в спешелти-кофейне',
        '- Знание расчёта рецепта эспрессо (доза, время, выход)',
        '- Альтернативные методы: V60, AeroPress, Chemex',
        '- Любовь к разговору с гостями',
        '',
        '## Условия',
        '- Зарплата от 75 000 ₽ + чаевые + бонус за продажи',
        '- Питание на смене, кофе с собой',
        '- Обучение в учебном центре партнёров',
        '- График 5/2, утренние смены 7:00–15:00',
        '',
        '## Как откликнуться',
        'Напишите в Telegram @coffeepoint_hr или оставьте отклик через форму — позвоним в течение рабочего дня.'
      ].join('\n')
    },
    create: {
      title: VACANCY_TITLE,
      slug: VACANCY_SLUG,
      summary: 'Утренние смены с 7:00, работа на эспрессо-машине La Marzocco Linea PB, дружная команда из трёх бариста.',
      status: ContentStatus.PUBLISHED,
      cityId: city.id,
      categoryId: category.id,
      businessAccountId: business.id,
      sortOrder: 0,
      publishedAt: now,
      createdById: user.id,
      updatedById: user.id,
      companyName: COMPANY_NAME,
      position: 'Бариста',
      employmentType: 'full_time',
      salaryLabel: 'от 75 000 ₽ + бонусы',
      experienceLabel: 'От 1 года в спешелти',
      contactMode: 'telegram',
      contactTelegram: '@coffeepoint_hr',
      contactPhone: '+7 (495) 000-12-34',
      contactEmail: email,
      description: [
        '## Кого ищем',
        'Бариста на утреннюю смену (7:00–15:00, 5/2) в точку Coffee Point на Большой Никитской. Работаем на спешелти-зёрнах локальной обжарки, V60, AeroPress, эспрессо-машина La Marzocco Linea PB.',
        '',
        '## Что важно',
        '- Опыт от 1 года в спешелти-кофейне',
        '- Знание расчёта рецепта эспрессо (доза, время, выход)',
        '- Альтернативные методы: V60, AeroPress, Chemex',
        '- Любовь к разговору с гостями',
        '',
        '## Условия',
        '- Зарплата от 75 000 ₽ + чаевые + бонус за продажи',
        '- Питание на смене, кофе с собой',
        '- Обучение в учебном центре партнёров',
        '- График 5/2, утренние смены 7:00–15:00',
        '',
        '## Как откликнуться',
        'Напишите в Telegram @coffeepoint_hr или оставьте отклик через форму — позвоним в течение рабочего дня.'
      ].join('\n')
    }
  });

  console.log('[seed-test-business] OK');
  console.log('  User email:        ', user.email);
  console.log('  User password:     ', password);
  console.log('  User role:         ', user.role);
  console.log('  Business slug:     ', business.slug);
  console.log('  Business status:   ', business.status);
  console.log('  Vacancy slug:      ', vacancy.slug);
  console.log('  Vacancy status:    ', vacancy.status);
  console.log('  Public URL:        ', `/vacancies/${vacancy.slug}`);
  console.log('  Business cabinet:  ', '/business/cabinet');
}

main()
  .catch((error) => {
    console.error('[seed-test-business] Failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
