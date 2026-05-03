import {
  getPublishedArticles,
  getPublishedCourses,
  getPublishedEvents,
  getPublishedPartners,
  getPublishedSuppliers,
  getPublishedVacancies
} from '@/lib/public/content';

type SharedListItem = Awaited<ReturnType<typeof getPublishedArticles>>['items'][number];

type HomepageCardKind = 'course' | 'event' | 'article' | 'vacancy' | 'supplier';

export type HomepageLiveCard = {
  kind: HomepageCardKind;
  eyebrow: string;
  title: string;
  summary: string;
  meta: string[];
  href: string;
  actionLabel: string;
  imageUrl?: string;
  isFallback: boolean;
};

export type HomepageData = {
  course: HomepageLiveCard;
  event: HomepageLiveCard;
  article: HomepageLiveCard;
  vacancy: HomepageLiveCard;
  supplier: HomepageLiveCard;
  partnerSignals: string[];
};

const fallbackCards: Record<HomepageCardKind, Omit<HomepageLiveCard, 'kind'>> = {
  course: {
    eyebrow: 'Образование',
    title: 'Обучение для команд и специалистов',
    summary: 'Здесь собраны интенсивы, корпоративные программы и материалы, к которым можно возвращаться в работе.',
    meta: ['Очные и онлайн-занятия', 'СКФО'],
    href: '/education',
    actionLabel: 'Запросить обучение',
    isFallback: true
  },
  event: {
    eyebrow: 'События',
    title: 'Ближайшие встречи и события',
    summary: 'В разделе есть лекции, гостевые смены, дегустации и встречи по городам региона.',
    meta: ['Афиша обновляется', 'СКФО'],
    href: '/events',
    actionLabel: 'Смотреть афишу',
    isFallback: true
  },
  article: {
    eyebrow: 'Знания',
    title: 'Материалы, интервью и рабочие разборы',
    summary: 'Тексты о сервисе, команде, меню, управлении и том, что реально работает в регионе.',
    meta: ['BARSYNERGY Index', 'Открытый доступ'],
    href: '/articles',
    actionLabel: 'Открыть материалы',
    isFallback: true
  },
  vacancy: {
    eyebrow: 'Вакансии',
    title: 'Вакансии для баров и команд региона',
    summary: 'Здесь можно откликнуться на открытую роль или отправить заявку на публикацию вакансии.',
    meta: ['Для кандидатов и компаний', 'СКФО'],
    href: '/vacancies',
    actionLabel: 'Смотреть вакансии',
    isFallback: true
  },
  supplier: {
    eyebrow: 'Поставщики',
    title: 'Каталог компаний, сервисов и полезных контактов',
    summary: 'Компании и сервисы, с которыми проще закрывать закупки, расходники и оборудование по региону.',
    meta: ['Закупки и сервис', 'B2B'],
    href: '/suppliers',
    actionLabel: 'Найти поставщика',
    isFallback: true
  }
};

function toHomepageCard(
  item: SharedListItem | undefined,
  kind: HomepageCardKind,
  href: string,
  actionLabel: string,
  eyebrow: string
): HomepageLiveCard {
  if (!item) {
    return {
      kind,
      ...fallbackCards[kind]
    };
  }

  return {
    kind,
    eyebrow,
    title: item.title,
    summary: item.summary,
    meta: item.meta.slice(0, 3),
    href,
    actionLabel,
    imageUrl: item.imageUrl,
    isFallback: false
  };
}

export async function getHomepageData(): Promise<HomepageData> {
  const [courses, upcomingEvents, latestEvents, articles, vacancies, suppliers, partners] = await Promise.all([
    getPublishedCourses({ pageSize: '1' }),
    getPublishedEvents({ pageSize: '1', period: 'upcoming' }),
    getPublishedEvents({ pageSize: '1' }),
    getPublishedArticles({ pageSize: '1' }),
    getPublishedVacancies({ pageSize: '1' }),
    getPublishedSuppliers({ pageSize: '1', verified: 'true' }),
    getPublishedPartners({ pageSize: '6', featured: 'true' })
  ]);

  const featuredEvent = upcomingEvents.items[0] ?? latestEvents.items[0];
  const featuredSupplier = suppliers.items[0];
  const partnerSignals =
    partners.items.length > 0
      ? partners.items.map((item) => item.title)
      : ['Партнёрские программы', 'Локальные бренды', 'Школы и площадки', 'Совместные проекты'];

  return {
    course: toHomepageCard(courses.items[0], 'course', '/education', 'Открыть обучение', 'Образование'),
    event: toHomepageCard(featuredEvent, 'event', '/events', 'Смотреть афишу', 'Ближайшее событие'),
    article: toHomepageCard(
      articles.items[0],
      'article',
      articles.items[0] ? `/articles/${articles.items[0].slug}` : '/articles',
      'Открыть материал',
      'BARSYNERGY Index'
    ),
    vacancy: toHomepageCard(vacancies.items[0], 'vacancy', '/vacancies', 'Смотреть вакансии', 'Открытая вакансия'),
    supplier: toHomepageCard(featuredSupplier, 'supplier', '/suppliers', 'Найти поставщика', 'Поставщик недели'),
    partnerSignals
  };
}
