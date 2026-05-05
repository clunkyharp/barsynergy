import { CategoryType, ContentStatus, FileVisibility } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getPublicFileUrl } from '@/lib/storage/public-url';
import { getRenderableExternalUrl } from '@/lib/validation/external-url';

export type PublicContentDetailFact = {
  label: string;
  value: string;
};

export type PublicContentDetailSection = {
  title: string;
  items: string[];
};

export type PublicContentDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  label?: string;
  meta: string[];
  body?: string;
  imageUrl?: string;
  facts: PublicContentDetailFact[];
  externalUrl?: string;
  externalUrlLabel?: string;
  companyName?: string;
  cityName?: string;
  sections?: PublicContentDetailSection[];
};

function publicImageUrl(
  file: { fileKey: string; bucket: string | null; visibility: FileVisibility } | null | undefined
) {
  if (!file || file.visibility !== FileVisibility.PUBLIC) {
    return undefined;
  }

  return getPublicFileUrl({
    fileKey: file.fileKey,
    bucket: file.bucket ?? undefined,
    visibility: 'public'
  });
}

function compact(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value && value.trim().length > 0));
}

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value.toLocaleDateString('ru-RU');
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value.toLocaleString('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export async function getPublishedArticleDetail(slug: string): Promise<PublicContentDetail | null> {
  const article = await prisma.article.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } },
      tags: {
        where: { tag: { isActive: true, type: CategoryType.ARTICLE } },
        orderBy: { tag: { sortOrder: 'asc' } },
        select: { tag: { select: { name: true } } }
      }
    }
  });

  if (!article) {
    return null;
  }

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    body: article.body,
    label: article.category?.name,
    meta: compact([
      article.city?.name,
      article.authorName,
      article.readingTimeMinutes ? `${article.readingTimeMinutes} мин` : undefined,
      ...article.tags.map((entry) => entry.tag.name)
    ]),
    imageUrl: publicImageUrl(article.coverImage),
    facts: compact([
      article.sourceLabel ? `Источник: ${article.sourceLabel}` : undefined,
      formatDate(article.publishedAt) ? `Опубликовано: ${formatDate(article.publishedAt)}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    })
  };
}

export async function getPublishedEventDetail(slug: string): Promise<PublicContentDetail | null> {
  const event = await prisma.event.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!event) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    label: event.category?.name,
    meta: compact([event.city?.name, event.format, formatDate(event.startsAt)]),
    imageUrl: publicImageUrl(event.coverImage),
    facts: compact([
      event.city?.name ? `Город: ${event.city.name}` : undefined,
      formatDateTime(event.startsAt) ? `Дата и время: ${formatDateTime(event.startsAt)}` : undefined,
      formatDateTime(event.endsAt) ? `Окончание: ${formatDateTime(event.endsAt)}` : undefined,
      event.locationName ? `Место: ${event.locationName}` : undefined,
      event.address ? `Адрес: ${event.address}` : undefined,
      event.format ? `Формат: ${event.format}` : undefined,
      'Для кого: специалисты, команды и партнёры индустрии',
      event.registrationMode ? `Регистрация: ${event.registrationMode}` : 'Регистрация: заявки принимаются через BARSYNERGY',
      'Участие: бесплатно или по условиям организатора',
      'Организатор: BARSYNERGY / партнёры',
      typeof event.capacity === 'number' ? `Мест: ${event.capacity}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    }),
    sections: [
      {
        title: 'Программа',
        items: [
          'Вступительная часть и знакомство с темой события.',
          'Практический блок: разбор продукта, сервиса, команды или запуска.',
          'Вопросы участников и короткий обмен контактами после основной части.'
        ]
      },
      {
        title: 'Кому подходит',
        items: [
          'Барменам, бар-менеджерам и управляющим, которым нужны практические примеры.',
          'Заведениям, которым нужен контакт с экспертами, брендами или поставщиками.',
          'Брендам и партнёрам, которые хотят понять аудиторию СКФО.'
        ]
      },
      {
        title: 'Что получит участник',
        items: [
          'Понятную тему встречи и контакты людей, с которыми можно продолжить разговор.',
          'Практические идеи для меню, сервиса, закупок, команды или продвижения.',
          'Понимание локального рынка без длинной теории.'
        ]
      },
      {
        title: 'Условия участия',
        items: [
          event.registrationMode
            ? `Регистрация: ${event.registrationMode}.`
            : 'Регистрация проходит через форму BARSYNERGY или контакт команды.',
          'Если формат ограничен по местам, команда подтвердит участие отдельно.',
          'Стоимость и специальные условия указываются организатором события.'
        ]
      },
      {
        title: 'Партнёры',
        items: ['Если событие проходит вместе с брендом или площадкой, их роль указывается в анонсе и материалах события.']
      }
    ]
  };
}

export async function getPublishedCourseDetail(slug: string): Promise<PublicContentDetail | null> {
  const course = await prisma.course.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!course) {
    return null;
  }

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    summary: course.summary,
    body: course.program,
    label: course.category?.name,
    meta: compact([course.city?.name, course.format, course.level, course.durationLabel]),
    imageUrl: publicImageUrl(course.coverImage),
    facts: compact([
      course.priceLabel ? `Стоимость: ${course.priceLabel}` : undefined,
      course.instructorName ? `Преподаватель: ${course.instructorName}` : undefined,
      formatDate(course.publishedAt) ? `Опубликовано: ${formatDate(course.publishedAt)}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    })
  };
}

export async function getPublishedVacancyDetail(slug: string): Promise<PublicContentDetail | null> {
  const vacancy = await prisma.vacancy.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!vacancy) {
    return null;
  }

  return {
    id: vacancy.id,
    title: vacancy.title,
    slug: vacancy.slug,
    summary: vacancy.summary,
    body: vacancy.description,
    label: vacancy.category?.name,
    meta: compact([vacancy.city?.name, vacancy.companyName, vacancy.employmentType, vacancy.salaryLabel]),
    imageUrl: publicImageUrl(vacancy.coverImage),
    companyName: vacancy.companyName,
    cityName: vacancy.city?.name,
    facts: compact([
      `Компания: ${vacancy.companyName}`,
      `Позиция: ${vacancy.position}`,
      vacancy.salaryLabel ? `Зарплата: ${vacancy.salaryLabel}` : undefined,
      vacancy.employmentType ? `График: ${vacancy.employmentType}` : undefined,
      vacancy.experienceLabel ? `Опыт: ${vacancy.experienceLabel}` : undefined,
      vacancy.contactMode ? `Контакт: ${vacancy.contactMode}` : undefined,
      formatDate(vacancy.publishedAt ?? vacancy.createdAt) ? `Обновлено: ${formatDate(vacancy.publishedAt ?? vacancy.createdAt)}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    })
  };
}

export async function getPublishedSupplierDetail(slug: string): Promise<PublicContentDetail | null> {
  const supplier = await prisma.supplier.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      city: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!supplier) {
    return null;
  }

  const externalUrl = getRenderableExternalUrl(supplier.websiteUrl);

  return {
    id: supplier.id,
    title: supplier.title,
    slug: supplier.slug,
    summary: supplier.summary,
    body: supplier.description,
    label: supplier.category?.name,
    meta: compact([supplier.city?.name, supplier.companyName, supplier.isVerified ? 'Проверенный поставщик' : undefined]),
    imageUrl: publicImageUrl(supplier.coverImage),
    companyName: supplier.companyName,
    facts: compact([
      `Компания: ${supplier.companyName}`,
      supplier.category?.name ? `Категория: ${supplier.category.name}` : undefined,
      supplier.city?.name ? `Город: ${supplier.city.name}` : undefined,
      supplier.serviceArea ? `Поставка: ${supplier.serviceArea}` : undefined,
      supplier.contactLabel ? `Контакт: ${supplier.contactLabel}` : undefined,
      supplier.isVerified ? 'Статус: проверен BARSYNERGY' : 'Статус: данные уточняются',
      'Минимальный заказ: по запросу у компании'
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    }),
    externalUrl,
    externalUrlLabel: externalUrl ? 'Сайт компании' : undefined
  };
}

export async function getPublishedPartnerDetail(slug: string): Promise<PublicContentDetail | null> {
  const partner = await prisma.partner.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: { select: { name: true } },
      coverImage: { select: { fileKey: true, bucket: true, visibility: true } }
    }
  });

  if (!partner) {
    return null;
  }

  const externalUrl = getRenderableExternalUrl(partner.websiteUrl);

  return {
    id: partner.id,
    title: partner.title,
    slug: partner.slug,
    summary: partner.summary,
    body: partner.description,
    label: partner.category?.name,
    meta: compact([partner.companyName, partner.partnerType, partner.isFeatured ? 'В подборке' : undefined]),
    imageUrl: publicImageUrl(partner.coverImage),
    companyName: partner.companyName,
    facts: compact([
      `Компания: ${partner.companyName}`,
      partner.partnerType ? `Тип партнёрства: ${partner.partnerType}` : undefined,
      partner.isFeatured ? 'Статус: В подборке' : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    }),
    externalUrl,
    externalUrlLabel: externalUrl ? 'Сайт партнёра' : undefined
  };
}
