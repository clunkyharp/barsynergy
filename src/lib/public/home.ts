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
    title: 'Программы для команд и специалистов',
    summary: 'Когда появятся новые курсы и интенсивы, они будут показаны здесь. Пока можно открыть раздел и посмотреть формат платформы.',
    meta: ['Очные и онлайн-форматы', 'СКФО'],
    href: '/education',
    actionLabel: 'Перейти в раздел образования',
    isFallback: true
  },
  event: {
    eyebrow: 'События',
    title: 'Ближайшие встречи и отраслевые форматы',
    summary: 'Здесь будет появляться ближайшее событие. Если афиша еще не заполнена, раздел все равно остается точкой входа в будущую программу.',
    meta: ['Афиша обновляется', 'СКФО'],
    href: '/events',
    actionLabel: 'Открыть афиши',
    isFallback: true
  },
  article: {
    eyebrow: 'Знания',
    title: 'Материалы, интервью и практические разборы',
    summary: 'Витрина знаний подключается к живым публикациям. Пока новых материалов нет, но раздел уже можно использовать как вход в медийную часть.',
    meta: ['Открытый доступ', 'Редакционные материалы'],
    href: '/articles',
    actionLabel: 'Перейти в раздел знаний',
    isFallback: true
  },
  vacancy: {
    eyebrow: 'Вакансии',
    title: 'Открытые роли для баров и команд региона',
    summary: 'Если сейчас нет опубликованных вакансий, этот блок все равно ведет в рабочий job-flow с откликами и размещением.',
    meta: ['Для кандидатов и бизнеса', 'СКФО'],
    href: '/vacancies',
    actionLabel: 'Перейти к вакансиям',
    isFallback: true
  },
  supplier: {
    eyebrow: 'Поставщики',
    title: 'Каталог компаний, сервисов и полезных контактов',
    summary: 'В этом блоке показывается заметный поставщик. Если каталог еще пуст, пользователь все равно попадает в рабочий вход для B2B-запросов.',
    meta: ['Каталог для закупок', 'B2B'],
    href: '/suppliers',
    actionLabel: 'Открыть каталог',
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
      : ['Партнерские программы', 'Локальные бренды', 'Школы и площадки', 'B2B-интеграции'];

  return {
    course: toHomepageCard(courses.items[0], 'course', '/education', 'Открыть программы', 'Образование'),
    event: toHomepageCard(featuredEvent, 'event', '/events', 'Открыть афиши', 'Ближайшее событие'),
    article: toHomepageCard(articles.items[0], 'article', '/articles', 'Читать материал', 'Новый материал'),
    vacancy: toHomepageCard(vacancies.items[0], 'vacancy', '/vacancies', 'Откликнуться на вакансию', 'Открытая вакансия'),
    supplier: toHomepageCard(featuredSupplier, 'supplier', '/suppliers', 'Открыть поставщика', 'Поставщик недели'),
    partnerSignals
  };
}
