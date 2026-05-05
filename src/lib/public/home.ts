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
  description: 'Обучение, события, вакансии и поставщики для барной индустрии СКФО.',
  signals: [],
  isFallback: true
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
    meta: ['Редакция BARSYNERGY', 'Открытый доступ'],
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
    summary: 'Компании и сервисы для закупок, расходников и оборудования по региону.',
    meta: ['Закупки и сервис', 'Для заведений'],
    href: '/suppliers',
    actionLabel: 'Найти поставщика',
    isFallback: true
  }
};

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
    getPublishedArticles({ pageSize: '1' }),
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
      orderBy: [{ priority: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }]
    }),
    prisma.homepageSocialBlock.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: [{ priority: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }]
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
  const partnerSignals =
    partners.items.length > 0
      ? partners.items.map((item) => item.title)
      : ['Партнёрские программы', 'Локальные бренды', 'Школы и площадки', 'Совместные проекты'];

  return {
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
      actionLabel: card.actionLabel,
      proof: card.proof ?? undefined,
      imagePath: card.imagePath ?? undefined,
      iconKey: card.iconKey ?? undefined
    })),
    course: toHomepageCard(courses.items[0], 'course', '/education', 'Открыть обучение', 'Образование'),
    event: toHomepageCard(featuredEvent, 'event', '/events', 'Смотреть афишу', 'Ближайшее событие'),
    article: toHomepageCard(
      articles.items[0],
      'article',
      articles.items[0] ? `/articles/${articles.items[0].slug}` : '/articles',
      'Открыть материал',
      'Редакция BARSYNERGY'
    ),
    vacancy: toHomepageCard(vacancies.items[0], 'vacancy', '/vacancies', 'Смотреть вакансии', 'Открытая вакансия'),
    supplier: toHomepageCard(featuredSupplier, 'supplier', '/suppliers', 'Найти поставщика', 'Поставщик недели'),
    generalSponsors,
    socialBlocks: socialBlocks.map((block) => ({
      id: block.id,
      name: block.name,
      title: block.title,
      description: block.description,
      helperText: block.helperText ?? block.name,
      actionLabel: block.actionLabel,
      href: block.href,
      logoPath: block.logoPath ?? '/icon.svg',
      variant: normalizeSocialVariant(block.variant)
    })),
    ctaBlock: ctaBlock
      ? {
          title: ctaBlock.title,
          description: ctaBlock.description,
          helperText: ctaBlock.helperText ?? undefined,
          primaryLabel: ctaBlock.primaryLabel,
          primaryHref: ctaBlock.primaryHref,
          secondaryLabel: ctaBlock.secondaryLabel ?? undefined,
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
          actionLabel: calculatorTeaser.actionLabel,
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
}
