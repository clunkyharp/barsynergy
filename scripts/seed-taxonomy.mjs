import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

const categories: { name: string; slug: string; type: CategoryType; sortOrder: number }[] = [
  { name: 'Организация работы', slug: 'organization', type: 'ARTICLE', sortOrder: 0 },
  { name: 'Рецепты и меню', slug: 'recipes-menu', type: 'ARTICLE', sortOrder: 1 },
  { name: 'Оборудование', slug: 'equipment', type: 'ARTICLE', sortOrder: 2 },
  { name: 'Сервис и гостеприимство', slug: 'service-hospitality', type: 'ARTICLE', sortOrder: 3 },
  { name: 'Управление и финансы', slug: 'management-finance', type: 'ARTICLE', sortOrder: 4 },
  { name: 'Карьера и образование', slug: 'career-education', type: 'ARTICLE', sortOrder: 5 },
  { name: 'Маркетинг и продвижение', slug: 'marketing-promotion', type: 'ARTICLE', sortOrder: 6 },

  { name: 'Мастер-классы', slug: 'master-classes', type: 'EVENT', sortOrder: 0 },
  { name: 'Дегустации', slug: 'tastings', type: 'EVENT', sortOrder: 1 },
  { name: 'Конкурсы', slug: 'competitions', type: 'EVENT', sortOrder: 2 },
  { name: 'Гостевые смены', slug: 'guest-shifts', type: 'EVENT', sortOrder: 3 },
  { name: 'Конференции', slug: 'conferences', type: 'EVENT', sortOrder: 4 },
  { name: 'Нетворкинг', slug: 'networking', type: 'EVENT', sortOrder: 5 },

  { name: 'Бариста', slug: 'barista', type: 'COURSE', sortOrder: 0 },
  { name: 'Миксология', slug: 'mixology', type: 'COURSE', sortOrder: 1 },
  { name: 'Управление заведением', slug: 'management', type: 'COURSE', sortOrder: 2 },
  { name: 'Кофе и обжарка', slug: 'coffee-roasting', type: 'COURSE', sortOrder: 3 },
  { name: 'Обслуживание гостей', slug: 'guest-service', type: 'COURSE', sortOrder: 4 },
  { name: 'СанПиН и ХАССП', slug: 'sanpin-haccp', type: 'COURSE', sortOrder: 5 },
  { name: 'Предпринимательство', slug: 'entrepreneurship', type: 'COURSE', sortOrder: 6 },

  { name: 'Бариста', slug: 'barista', type: 'VACANCY', sortOrder: 0 },
  { name: 'Повар', slug: 'cook', type: 'VACANCY', sortOrder: 1 },
  { name: 'Управляющий', slug: 'manager', type: 'VACANCY', sortOrder: 2 },
  { name: 'Администратор', slug: 'administrator', type: 'VACANCY', sortOrder: 3 },
  { name: 'Бармен', slug: 'bartender', type: 'VACANCY', sortOrder: 4 },
  { name: 'Официант', slug: 'waiter', type: 'VACANCY', sortOrder: 5 },
  { name: 'Шеф-повар', slug: 'chef', type: 'VACANCY', sortOrder: 6 },
  { name: 'Хостес', slug: 'hostess', type: 'VACANCY', sortOrder: 7 },
  { name: 'Менеджер по закупкам', slug: 'purchase-manager', type: 'VACANCY', sortOrder: 8 },
  { name: 'SMM-менеджер', slug: 'smm-manager', type: 'VACANCY', sortOrder: 9 },

  { name: 'Кофе и чай', slug: 'coffee-tea', type: 'SUPPLIER', sortOrder: 0 },
  { name: 'Оборудование', slug: 'equipment', type: 'SUPPLIER', sortOrder: 1 },
  { name: 'Расходные материалы', slug: 'consumables', type: 'SUPPLIER', sortOrder: 2 },
  { name: 'Молоко и альтернативы', slug: 'milk-alternatives', type: 'SUPPLIER', sortOrder: 3 },
  { name: 'Сиропы и топпинги', slug: 'syrups-toppings', type: 'SUPPLIER', sortOrder: 4 },
  { name: 'Упаковка', slug: 'packaging', type: 'SUPPLIER', sortOrder: 5 },
  { name: 'Маркетинговые материалы', slug: 'marketing-materials', type: 'SUPPLIER', sortOrder: 6 },
  { name: 'Мебель и интерьер', slug: 'furniture-interior', type: 'SUPPLIER', sortOrder: 7 },
  { name: 'IT и автоматизация', slug: 'it-automation', type: 'SUPPLIER', sortOrder: 8 },

  { name: 'Кофейни', slug: 'coffee-shops', type: 'PARTNER', sortOrder: 0 },
  { name: 'Бары', slug: 'bars', type: 'PARTNER', sortOrder: 1 },
  { name: 'Рестораны', slug: 'restaurants', type: 'PARTNER', sortOrder: 2 },
  { name: 'Образовательные центры', slug: 'education-centers', type: 'PARTNER', sortOrder: 3 },
  { name: 'Обжарщики', slug: 'roasters', type: 'PARTNER', sortOrder: 4 },
  { name: 'Поставщики', slug: 'suppliers', type: 'PARTNER', sortOrder: 5 },

  { name: 'Бариста', slug: 'barista', type: 'MASTER', sortOrder: 0 },
  { name: 'Миксолог', slug: 'mixologist', type: 'MASTER', sortOrder: 1 },
  { name: 'Тренер-технолог', slug: 'trainer-technologist', type: 'MASTER', sortOrder: 2 },
  { name: 'Консультант', slug: 'consultant', type: 'MASTER', sortOrder: 3 },
  { name: 'Обжарщик', slug: 'roaster', type: 'MASTER', sortOrder: 4 },
  { name: 'Шеф-бариста', slug: 'head-barista', type: 'MASTER', sortOrder: 5 },

  { name: 'Ремонт оборудования', slug: 'equipment-repair', type: 'SERVICE', sortOrder: 0 },
  { name: 'Аудит заведения', slug: 'venue-audit', type: 'SERVICE', sortOrder: 1 },
  { name: 'Консалтинг', slug: 'consulting', type: 'SERVICE', sortOrder: 2 },
  { name: 'Разработка меню', slug: 'menu-development', type: 'SERVICE', sortOrder: 3 },
  { name: 'Подбор персонала', slug: 'staff-recruitment', type: 'SERVICE', sortOrder: 4 },
  { name: 'Обучение команды', slug: 'team-training', type: 'SERVICE', sortOrder: 5 },
  { name: 'Кейтеринг', slug: 'catering', type: 'SERVICE', sortOrder: 6 },
  { name: 'Дизайн интерьера', slug: 'interior-design', type: 'SERVICE', sortOrder: 7 },
  { name: 'Брендинг и упаковка', slug: 'branding-packaging', type: 'SERVICE', sortOrder: 8 },
  { name: 'Юридические услуги', slug: 'legal-services', type: 'SERVICE', sortOrder: 9 },

  { name: 'Новости', slug: 'news', type: 'GENERAL', sortOrder: 0 },
  { name: 'Объявления', slug: 'announcements', type: 'GENERAL', sortOrder: 1 },
  { name: 'Акции', slug: 'promotions', type: 'GENERAL', sortOrder: 2 },
  { name: 'Обзоры', slug: 'reviews', type: 'GENERAL', sortOrder: 3 },
];

const skills = [
  'Приготовление кофе',
  'Латте-арт',
  'Миксология',
  'Коктейльная карта',
  'Обслуживание гостей',
  'Работа на кассе',
  'Открытие/закрытие смены',
  'Подготовка напитков',
  'Санитарные нормы',
  'ХАССП',
  'Инвентаризация',
  'Закупка продуктов',
  'Калькуляция блюд',
  'Управление персоналом',
  'Составление графиков',
  'Найм и адаптация',
  'Тренинг команды',
  'Работа с возражениями',
  'Конфликт-менеджмент',
  'SMM и маркетинг',
  'Таргетинговая реклама',
  'Работа с отзывами',
  'Фотография еды и напитков',
  'Брендинг заведения',
  'Финансовое планирование',
  'Управление прибылью',
  'Работа с кассой и отчётами',
  'Аналитика продаж',
  'Работа с CRM',
  'Английский язык (базовый)',
  'Английский язык (разговорный)',
  'Проведение дегустаций',
  'Организация мероприятий',
  'Работа с оборудованием',
  'Настройка кофемашины',
  'Помол и экстракция',
  'Каппинг',
  'Обжарка кофе',
  'Подбор кофейного зерна',
  'Создание меню кофе',
  'Бариста-скиллы',
  'Ведение каналов',
  'Чат-поддержка',
  'Бухгалтерская отчётность',
  'Работа с 1С',
  'Ремонт кофемашин',
  'Профилактика оборудования',
  'Холодные напитки',
  'Фильтр-кофе',
  'Аэропресс и альтернатива',
];

const cities = [
  { name: 'Махачкала', slug: 'makhachkala', region: 'Дагестан' },
  { name: 'Грозный', slug: 'grozny', region: 'Чечня' },
  { name: 'Ставрополь', slug: 'stavropol', region: 'Ставропольский край' },
  { name: 'Нальчик', slug: 'nalchik', region: 'Кабардино-Балкария' },
  { name: 'Владикавказ', slug: 'vladikavkaz', region: 'Северная Осетия — Алания' },
  { name: 'Черкесск', slug: 'cherkessk', region: 'Карачаево-Черкесия' },
  { name: 'Майкоп', slug: 'maykop', region: 'Адыгея' },
  { name: 'Назрань', slug: 'nazran', region: 'Ингушетия' },
  { name: 'Элиста', slug: 'elista', region: 'Калмыкия' },
  { name: 'Пятигорск', slug: 'pyatigorsk', region: 'Ставропольский край' },
  { name: 'Кисловодск', slug: 'kislovodsk', region: 'Ставропольский край' },
  { name: 'Ессентуки', slug: 'yessentuki', region: 'Ставропольский край' },
  { name: 'Минеральные Воды', slug: 'mineralnye-vody', region: 'Ставропольский край' },
  { name: 'Хасавюрт', slug: 'khasavyurt', region: 'Дагестан' },
  { name: 'Дербент', slug: 'derbent', region: 'Дагестан' },
  { name: 'Каспийск', slug: 'kaspiysk', region: 'Дагестан' },
  { name: 'Армавир', slug: 'armavir', region: 'Краснодарский край' },
  { name: 'Краснодар', slug: 'krasnodar', region: 'Краснодарский край' },
  { name: 'Ростов-на-Дону', slug: 'rostov-on-don', region: 'Ростовская область' },
];

async function seedCategories(count: number) {
  let created = 0;
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug_type: { slug: cat.slug, type: cat.type } }
    });
    if (!existing) {
      await prisma.category.create({ data: { ...cat, description: null } });
      created++;
    }
  }
  console.log(`Categories: ${created} new, ${count} total`);
}

async function seedSkills(count: number) {
  let created = 0;
  for (const name of skills) {
    const slug = name.toLowerCase().replace(/[^a-zа-яё0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await prisma.skill.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.skill.create({ data: { name, slug, sortOrder: 0 } });
      created++;
    }
  }
  console.log(`Skills: ${created} new, ${count} total`);
}

async function seedCities() {
  let created = 0;
  for (const city of cities) {
    const existing = await prisma.city.findUnique({ where: { slug: city.slug } });
    if (!existing) {
      await prisma.city.create({
        data: { name: city.name, slug: city.slug, region: city.region }
      });
      created++;
    }
  }
  const total = await prisma.city.count();
  console.log(`Cities: ${created} new, ${total} total`);
}

async function main() {
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    await seedCategories(catCount);
  } else {
    console.log(`Categories already present (${catCount}), skipping.`);
  }

  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    await seedSkills(skillCount);
  } else {
    console.log(`Skills already present (${skillCount}), skipping.`);
  }

  await seedCities();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
