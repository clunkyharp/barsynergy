import { revalidatePath } from 'next/cache';
import {
  getPublishedArticles,
  getPublishedCourses,
  getPublishedEvents,
  getPublishedPartners,
  getPublishedSuppliers,
  getPublishedVacancies
} from '@/lib/public/content';
import { getPublishedGeneralSponsors, type GeneralSponsor } from '@/lib/public/general-sponsors';
import { ContentStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

const HOMEPAGE_CACHE_TTL_MS = 300_000;

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
  authorName?: string;
  isFallback: boolean;
};

export type HomepageHeroBlock = {
  eyebrow: string;
  title: string;
  description: string;
  signals: {
    value: string;
    label: string;
  }[];
  isFallback: boolean;
};

export type HomepageAudienceCardBlock = {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  proof?: string;
  imagePath?: string;
  iconKey?: string;
};

export type HomepageSocialBlock = {
  id: string;
  name: string;
  title: string;
  description: string;
  helperText: string;
  actionLabel: string;
  href: string;
  logoPath: string;
  variant: 'telegram' | 'whatsapp' | 'instagram';
};

export type HomepageCtaBlock = {
  title: string;
  description: string;
  helperText?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export type HomepageCalculatorTeaserBlock = {
  eyebrow: string;
  title: string;
  cardEyebrow: string;
  cardTitle: string;
  description: string;
  steps: string[];
  actionLabel: string;
  actionHref: string;
};

export type HomepageData = {
  hero: HomepageHeroBlock;
  audienceCards: HomepageAudienceCardBlock[];
  course: HomepageLiveCard;
  event: HomepageLiveCard;
  article: HomepageLiveCard;
  secondaryArticle?: HomepageLiveCard;
  vacancy: HomepageLiveCard;
  supplier: HomepageLiveCard;
  generalSponsors: GeneralSponsor[];
  socialBlocks: HomepageSocialBlock[];
  ctaBlock?: HomepageCtaBlock;
  calculatorTeaser?: HomepageCalculatorTeaserBlock;
  partnerSignals: string[];
  stats: {
    courses: number;
    events: number;
    articles: number;
    vacancies: number;
    suppliers: number;
    partners: number;
  };
};

const fallbackHero: HomepageHeroBlock = {
  eyebrow: 'Обучение, события, вакансии',
  title: 'BARSYNERGY',
  description: 'Обучение, события, вакансии, поставщики и партнёрские предложения для барной индустрии СКФО.',
  signals: [],
  isFallback: true
};

const HOMEPAGE_AUDIENCE_CARD_LIMIT = 3;
const HOMEPAGE_SOCIAL_BLOCK_LIMIT = 3;

const fallbackCards: Record<HomepageCardKind, Omit<HomepageLiveCard, 'kind'>> = {
  course: {
    eyebrow: 'Обучение',
    title: 'Обучение для команд и специалистов',
    summary: 'Интенсивы, командные программы и материалы для задач сервиса, меню и смены.',
    meta: ['Очные и онлайн-занятия', 'СКФО'],
    href: '/education',
    actionLabel: 'Выбрать программу',
    isFallback: true
  },
  event: {
    eyebrow: 'События',
    title: 'Ближайшие встречи и события',
    summary: 'В разделе есть лекции, гостевые смены, дегустации и встречи по городам региона.',
    meta: ['Афиша обновляется', 'СКФО'],
    href: '/events',
    actionLabel: 'Выбрать событие',
    isFallback: true
  },
  article: {
    eyebrow: 'Знания',
    title: 'Материалы, интервью и рабочие разборы',
    summary: 'Тексты о сервисе, команде, меню, управлении и том, что реально работает в регионе.',
    meta: ['Редакция BARSYNERGY', 'Открытый доступ'],
    href: '/articles',
    actionLabel: 'Читать материалы',
    imageUrl: '/images/generated/content-service.jpg',
    isFallback: true
  },
  vacancy: {
    eyebrow: 'Вакансии',
    title: 'Вакансии для баров и команд региона',
    summary: 'Здесь можно откликнуться на открытую роль или отправить заявку на публикацию вакансии.',
    meta: ['Для кандидатов и компаний', 'СКФО'],
    href: '/vacancies',
    actionLabel: 'Найти вакансию',
    isFallback: true
  },
  supplier: {
    eyebrow: 'Поставщики',
    title: 'Каталог компаний, сервисов и контактов',
    summary: 'Компании для закупок, расходников, оборудования и сервисных задач по региону.',
    meta: ['Закупки и сервис', 'Для заведений'],
    href: '/suppliers',
    actionLabel: 'Смотреть поставщиков',
    isFallback: true
  }
};

const homepageEditorialImageOverrides = {
  featuredArticle: '/images/home/current-featured-hero.png',
  vacancy: '/images/home/current-vacancy-card.png',
  secondaryArticle: '/images/home/current-event-card.png',
  supplier: '/images/home/current-supplier-card.png',
  event: '/images/generated/program-events.jpg',
  course: '/images/home/professional-education.webp'
} as const;

function parseLinePairs(value?: string | null) {
  return (value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [first, ...rest] = line.split('|');

      return {
        value: first.trim(),
        label: rest.join('|').trim()
      };
    })
    .filter((item) => item.value.length > 0 && item.label.length > 0);
}

function parseLines(value?: string | null) {
  return (value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeSocialVariant(value?: string | null): HomepageSocialBlock['variant'] {
  if (value === 'telegram' || value === 'whatsapp' || value === 'instagram') {
    return value;
  }

  return 'telegram';
}

function normalizePublicActionLabel(label: string) {
  const trimmedLabel = label.trim();
  const replacements: Record<string, string> = {
    'Написать команде': 'Связаться с нами',
    'Открыть обучение': 'Выбрать программу',
    'Посмотреть обучение': 'Выбрать программу',
    'Открыть каталог': 'Смотреть поставщиков',
    'Смотреть каталог': 'Смотреть поставщиков',
    'Открыть калькулятор': 'Рассчитать себестоимость',
    'Открыть расчёт': 'Рассчитать себестоимость',
    'Открыть программу': 'Смотреть программу',
    'Открыть профиль': 'Смотреть профиль',
    'Открыть форму заявки': 'Оставить заявку',
    'Открыть отклик': 'Откликнуться на вакансию',
    'Открыть Telegram': 'Написать в Telegram',
    'Открыть WhatsApp': 'Написать в WhatsApp',
    'Открыть Instagram': 'Смотреть Instagram',
    'Открыть сайт': 'Смотреть сайт',
    'Открыть канал': 'Смотреть канал'
  };

  return replacements[trimmedLabel] ?? trimmedLabel;
}

function hasLikelyGarbageTitle(title: string): boolean {
  const trimmed = title.trim();
  if (trimmed.length < 5) return true;
  if (trimmed.length > 15 && !trimmed.includes(' ')) return true;
  return false;
}

function toHomepageCard(
  item: SharedListItem | undefined,
  kind: HomepageCardKind,
  href: string,
  actionLabel: string,
  eyebrow: string
): HomepageLiveCard {
  if (!item || hasLikelyGarbageTitle(item.title)) {
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
    imageUrl: item.imageUrl ?? fallbackCards[kind].imageUrl,
    authorName: item.authorName,
    isFallback: false
  };
}

function withHomepageImageOverride(card: HomepageLiveCard, imageUrl?: string): HomepageLiveCard {
  if (!imageUrl) {
    return card;
  }

  return {
    ...card,
    imageUrl
  };
}

const homepageCache = new Map<string, { data: HomepageData; expiresAt: number }>();

export function revalidateHomepageCache() {
  homepageCache.delete('homepage');
  revalidatePath('/');
}

export async function getHomepageData(): Promise<HomepageData> {
  const cached = homepageCache.get('homepage');
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  const [
    courses,
    upcomingEvents,
    latestEvents,
    articles,
    vacancies,
    suppliers,
    partners,
    generalSponsors,
    homepageHero,
    audienceCards,
    socialBlocks,
    ctaBlock,
    calculatorTeaser
  ] = await Promise.all([
    getPublishedCourses({ pageSize: '1' }),
    getPublishedEvents({ pageSize: '1', period: 'upcoming' }),
    getPublishedEvents({ pageSize: '1' }),
    getPublishedArticles({ pageSize: '2' }),
    getPublishedVacancies({ pageSize: '1' }),
    getPublishedSuppliers({ pageSize: '1', verified: 'true' }),
    getPublishedPartners({ pageSize: '6', featured: 'true' }),
    getPublishedGeneralSponsors(2),
    prisma.homepageHero.findFirst({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ priority: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }]
    }),
    prisma.homepageAudienceCard.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ priority: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }],
      take: HOMEPAGE_AUDIENCE_CARD_LIMIT
    }),
    prisma.homepageSocialBlock.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ priority: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }],
      take: HOMEPAGE_SOCIAL_BLOCK_LIMIT
    }),
    prisma.homepageCtaBlock.findFirst({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ priority: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }]
    }),
    prisma.homepageCalculatorTeaser.findFirst({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ priority: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }]
    })
  ]);

  const featuredEvent = upcomingEvents.items[0] ?? latestEvents.items[0];
  const featuredSupplier = suppliers.items[0];
  const featuredArticle = withHomepageImageOverride(
    toHomepageCard(
      articles.items[0],
      'article',
      articles.items[0] ? `/articles/${articles.items[0].slug}` : '/articles',
      'Читать материал',
      'Редакция BARSYNERGY'
    ),
    homepageEditorialImageOverrides.featuredArticle
  );
  const secondaryArticle = articles.items[1]
    ? withHomepageImageOverride(
        toHomepageCard(articles.items[1], 'article', `/articles/${articles.items[1].slug}`, 'Читать материал', 'Материал'),
        homepageEditorialImageOverrides.secondaryArticle
      )
    : undefined;
  const featuredVacancy = withHomepageImageOverride(
    toHomepageCard(vacancies.items[0], 'vacancy', vacancies.items[0] ? `/vacancies/${vacancies.items[0].slug}` : '/vacancies', 'Найти вакансию', 'Открытая вакансия'),
    homepageEditorialImageOverrides.vacancy
  );
  const supplierCard = withHomepageImageOverride(
    toHomepageCard(featuredSupplier, 'supplier', featuredSupplier ? `/suppliers/${featuredSupplier.slug}` : '/suppliers', 'Смотреть поставщиков', 'Поставщик'),
    homepageEditorialImageOverrides.supplier
  );
  const partnerSignals =
    partners.items.length > 0
      ? partners.items.map((item) => item.title)
      : ['События с партнёрами', 'Локальные бренды', 'Школы и площадки', 'Совместные проекты'];

  const result: HomepageData = {
    hero: homepageHero
      ? {
          eyebrow: homepageHero.eyebrow,
          title: homepageHero.title,
          description: homepageHero.description,
          signals: parseLinePairs(homepageHero.signalsText),
          isFallback: false
        }
      : fallbackHero,
    audienceCards: audienceCards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      href: card.href,
      actionLabel: normalizePublicActionLabel(card.actionLabel),
      proof: card.proof ?? undefined,
      imagePath: card.imagePath ?? undefined,
      iconKey: card.iconKey ?? undefined
    })),
    course: toHomepageCard(courses.items[0], 'course', courses.items[0] ? `/education/${courses.items[0].slug}` : '/education', 'Выбрать программу', 'Обучение'),
    event: toHomepageCard(featuredEvent, 'event', featuredEvent ? `/events/${featuredEvent.slug}` : '/events', 'Выбрать событие', 'Ближайшее событие'),
    article: featuredArticle,
    secondaryArticle,
    vacancy: featuredVacancy,
    supplier: supplierCard,
    generalSponsors,
    socialBlocks: socialBlocks.map((block) => ({
      id: block.id,
      name: block.name,
      title: block.title,
      description: block.description,
      helperText: block.helperText ?? block.name,
      actionLabel: normalizePublicActionLabel(block.actionLabel),
      href: block.href,
      logoPath: block.logoPath ?? '/icon.svg',
      variant: normalizeSocialVariant(block.variant)
    })),
    ctaBlock: ctaBlock
      ? {
          title: ctaBlock.title,
          description: ctaBlock.description,
          helperText: ctaBlock.helperText ?? undefined,
          primaryLabel: normalizePublicActionLabel(ctaBlock.primaryLabel),
          primaryHref: ctaBlock.primaryHref,
          secondaryLabel: ctaBlock.secondaryLabel ? normalizePublicActionLabel(ctaBlock.secondaryLabel) : undefined,
          secondaryHref: ctaBlock.secondaryHref ?? undefined
        }
      : undefined,
    calculatorTeaser: calculatorTeaser
      ? {
          eyebrow: calculatorTeaser.eyebrow,
          title: calculatorTeaser.title,
          cardEyebrow: calculatorTeaser.cardEyebrow,
          cardTitle: calculatorTeaser.cardTitle,
          description: calculatorTeaser.description,
          steps: parseLines(calculatorTeaser.stepsText),
          actionLabel: normalizePublicActionLabel(calculatorTeaser.actionLabel),
          actionHref: calculatorTeaser.actionHref
        }
      : undefined,
    partnerSignals,
    stats: {
      courses: courses.total,
      events: latestEvents.total,
      articles: articles.total,
      vacancies: vacancies.total,
      suppliers: suppliers.total,
      partners: partners.total
    }
  };

  homepageCache.set('homepage', { data: result, expiresAt: Date.now() + HOMEPAGE_CACHE_TTL_MS });
  return result;
}
