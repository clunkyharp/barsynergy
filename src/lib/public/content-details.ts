import { CategoryType, ContentStatus, FileVisibility } from '@prisma/client';
import {
  courseFormatOptions,
  courseLevelOptions,
  eventFormatOptions,
  eventRegistrationModeOptions,
  getAdminOptionLabel,
  partnerTypeOptions,
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions
} from '@/lib/admin/content-labels';
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

export type PublicContentImage = {
  src: string;
  alt: string;
};

export type PublicContentDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  startsAtIso?: string;
  label?: string;
  meta: string[];
  body?: string;
  imageUrl?: PublicContentImage;
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

function publicImage(
  file: { fileKey: string; bucket: string | null; visibility: FileVisibility } | null | undefined,
  alt: string | null | undefined,
  fallbackAlt: string
): PublicContentImage | undefined {
  const src = publicImageUrl(file);

  if (!src) {
    return undefined;
  }

  return {
    src,
    alt: alt?.trim() || fallbackAlt
  };
}

function compact(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value && value.trim().length > 0));
}

function cleanPublicDetailText(value: string) {
  return value
    .replace(/(^|\s)[Дд]емо[-\s]+/g, '$1')
    .replace(/^поставщик\b/u, 'Поставщик')
    .replace(/^материал\b/u, 'Материал')
    .replace(/^событие\b/u, 'Событие')
    .replace(/^вакансия\b/u, 'Вакансия')
    .trim();
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

function eventPlaceLabel(locationName?: string | null, cityName?: string | null) {
  if (locationName && cityName) {
    return `${locationName}, ${cityName}`;
  }

  return locationName ?? cityName ?? 'место уточняется';
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
    summary: cleanPublicDetailText(article.summary),
    body: article.body ? cleanPublicDetailText(article.body) : article.body,
    label: article.category?.name,
    meta: compact([
      article.city?.name,
      article.authorName,
      article.readingTimeMinutes ? `${article.readingTimeMinutes} мин` : undefined,
      ...article.tags.map((entry) => entry.tag.name)
    ]),
    imageUrl: publicImage(article.coverImage, article.coverImageAlt, article.title),
    facts: compact([
      article.sourceLabel ? `Источник: ${article.sourceLabel}` : undefined,
      formatDate(article.publishedAt) ? `Опубликовано: ${formatDate(article.publishedAt)}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    }),
    sections: [
      {
        title: 'В материале',
        items: compact([
          article.category?.name ? `Тема: ${article.category.name}.` : undefined,
          article.city?.name ? `Городской контекст: ${article.city.name}.` : undefined,
          article.authorName ? `Автор: ${article.authorName}.` : undefined,
          article.readingTimeMinutes ? `Время чтения: ${article.readingTimeMinutes} мин.` : undefined
        ])
      },
      {
        title: 'Как использовать',
        items: compact([
          'Сохраните материал как ориентир по теме.',
          article.tags.length > 0 ? `Связанные метки: ${article.tags.map((entry) => entry.tag.name).join(', ')}.` : undefined,
          'Переходите к похожим материалам ниже, если нужен следующий контекст.'
        ])
      }
    ].filter((section) => section.items.length > 0)
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
    summary: cleanPublicDetailText(event.summary),
    startsAtIso: event.startsAt.toISOString(),
    label: event.category?.name,
    meta: compact([event.city?.name, getAdminOptionLabel(eventFormatOptions, event.format, ''), formatDate(event.startsAt)]),
    imageUrl: publicImage(event.coverImage, event.coverImageAlt, event.title),
    facts: compact([
      event.city?.name ? `Город: ${event.city.name}` : undefined,
      formatDateTime(event.startsAt) ? `Дата и время: ${formatDateTime(event.startsAt)}` : undefined,
      formatDateTime(event.endsAt) ? `Окончание: ${formatDateTime(event.endsAt)}` : undefined,
      event.locationName ? `Место: ${event.locationName}` : undefined,
      event.address ? `Адрес: ${event.address}` : undefined,
      event.format ? `Формат: ${getAdminOptionLabel(eventFormatOptions, event.format)}` : undefined,
      'Для кого: специалисты, команды и партнёры индустрии',
      event.registrationMode
        ? `Регистрация: ${getAdminOptionLabel(eventRegistrationModeOptions, event.registrationMode)}`
        : 'Регистрация: заявки принимаются через BARSYNERGY',
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
        title: 'Перед участием',
        items: compact([
          formatDateTime(event.startsAt) ? `Дата и время: ${formatDateTime(event.startsAt)}.` : undefined,
          event.locationName || event.city?.name ? `Место: ${eventPlaceLabel(event.locationName, event.city?.name)}.` : undefined,
          event.format ? `Формат: ${getAdminOptionLabel(eventFormatOptions, event.format)}.` : undefined,
          event.registrationMode
            ? `Регистрация: ${getAdminOptionLabel(eventRegistrationModeOptions, event.registrationMode)}.`
            : 'Регистрация проходит через форму BARSYNERGY.'
        ])
      },
      {
        title: 'Кому подходит',
        items: [
          'Барменам, бар-менеджерам и управляющим, которым нужны практические примеры.',
          'Заведениям, которым нужен контакт с экспертами, брендами или поставщиками.',
          'Брендам и партнёрам, которые хотят понять аудиторию СКФО.'
        ]
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
    summary: cleanPublicDetailText(course.summary),
    body: course.program ? cleanPublicDetailText(course.program) : course.program,
    label: course.category?.name,
    meta: compact([
      course.city?.name,
      getAdminOptionLabel(courseFormatOptions, course.format, ''),
      getAdminOptionLabel(courseLevelOptions, course.level, ''),
      course.durationLabel
    ]),
    imageUrl: publicImage(course.coverImage, course.coverImageAlt, course.title),
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
    }),
    sections: [
      {
        title: 'Параметры программы',
        items: compact([
          course.format ? `Формат: ${getAdminOptionLabel(courseFormatOptions, course.format)}.` : undefined,
          course.level ? `Уровень: ${getAdminOptionLabel(courseLevelOptions, course.level)}.` : undefined,
          course.durationLabel ? `Длительность: ${course.durationLabel}.` : undefined,
          course.instructorName ? `Преподаватель: ${course.instructorName}.` : undefined,
          course.priceLabel ? `Стоимость: ${course.priceLabel}.` : undefined
        ])
      },
      {
        title: 'Следующий шаг',
        items: [
          'Оставьте заявку, если хотите уточнить расписание, формат или состав группы.',
          'В заявке можно указать город, уровень подготовки и удобный контакт.'
        ]
      }
    ].filter((section) => section.items.length > 0)
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
    summary: cleanPublicDetailText(vacancy.summary),
    body: vacancy.description ? cleanPublicDetailText(vacancy.description) : vacancy.description,
    label: vacancy.category?.name,
    meta: compact([
      vacancy.city?.name,
      vacancy.companyName,
      getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType, ''),
      vacancy.salaryLabel
    ]),
    imageUrl: publicImage(vacancy.coverImage, vacancy.coverImageAlt, vacancy.title),
    companyName: vacancy.companyName,
    cityName: vacancy.city?.name,
    facts: compact([
      `Компания: ${vacancy.companyName}`,
      `Позиция: ${vacancy.position}`,
      vacancy.salaryLabel ? `Зарплата: ${vacancy.salaryLabel}` : undefined,
      vacancy.employmentType ? `График: ${getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType)}` : undefined,
      vacancy.experienceLabel ? `Опыт: ${getAdminOptionLabel(vacancyExperienceOptions, vacancy.experienceLabel)}` : undefined,
      vacancy.contactMode ? `Контакт: ${vacancy.contactMode}` : undefined,
      formatDate(vacancy.publishedAt ?? vacancy.createdAt) ? `Обновлено: ${formatDate(vacancy.publishedAt ?? vacancy.createdAt)}` : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    }),
    sections: [
      {
        title: 'Условия роли',
        items: compact([
          `Компания: ${vacancy.companyName}.`,
          vacancy.city?.name ? `Город: ${vacancy.city.name}.` : undefined,
          vacancy.salaryLabel ? `Зарплата: ${vacancy.salaryLabel}.` : undefined,
          vacancy.employmentType ? `График: ${getAdminOptionLabel(vacancyEmploymentTypeOptions, vacancy.employmentType)}.` : undefined,
          vacancy.experienceLabel ? `Опыт: ${getAdminOptionLabel(vacancyExperienceOptions, vacancy.experienceLabel)}.` : undefined
        ])
      },
      {
        title: 'Как откликнуться',
        items: compact([
          'Нажмите «Откликнуться» и заполните форму на этой странице.',
          'Можно приложить резюме или оставить ссылку на профиль.',
          vacancy.contactMode ? `Контакт после проверки: ${vacancy.contactMode}.` : undefined
        ])
      }
    ].filter((section) => section.items.length > 0)
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
    summary: cleanPublicDetailText(supplier.summary),
    body: cleanPublicDetailText(supplier.description),
    label: supplier.category?.name,
    meta: compact([supplier.city?.name, supplier.companyName, supplier.isVerified ? 'Проверенный поставщик' : undefined]),
    imageUrl: publicImage(supplier.coverImage, supplier.coverImageAlt, supplier.title),
    companyName: supplier.companyName,
    facts: compact([
      `Компания: ${supplier.companyName}`,
      supplier.category?.name ? `Категория: ${supplier.category.name}` : undefined,
      supplier.city?.name ? `Город: ${supplier.city.name}` : undefined,
      supplier.serviceArea ? `География: ${supplier.serviceArea}` : undefined,
      supplier.contactLabel ? `Контакты: ${supplier.contactLabel}` : undefined,
      supplier.isVerified ? 'Статус: проверен BARSYNERGY' : 'Статус: контакт для уточнения',
      'Условия: уточняйте у компании'
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    }),
    externalUrl,
    externalUrlLabel: externalUrl ? 'Сайт компании' : undefined,
    sections: [
      {
        title: 'Профиль поставщика',
        items: compact([
          supplier.category?.name ? `Категория: ${supplier.category.name}.` : undefined,
          supplier.city?.name ? `Базовый город: ${supplier.city.name}.` : undefined,
          supplier.serviceArea ? `Зона поставки: ${supplier.serviceArea}.` : undefined,
          supplier.isVerified ? 'Поставщик отмечен как проверенный в BARSYNERGY.' : 'Условия и актуальность контакта нужно уточнить у компании.'
        ])
      },
      {
        title: 'Контакт',
        items: compact([
          'Используйте кнопку связи, чтобы передать запрос с выбранным поставщиком.',
          supplier.contactLabel ? `Контактный ориентир: ${supplier.contactLabel}.` : undefined,
          externalUrl ? 'Сайт компании доступен отдельной ссылкой.' : undefined
        ])
      }
    ].filter((section) => section.items.length > 0)
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
    summary: cleanPublicDetailText(partner.summary),
    body: partner.description ? cleanPublicDetailText(partner.description) : partner.description,
    label: partner.category?.name,
    meta: compact([
      partner.companyName,
      getAdminOptionLabel(partnerTypeOptions, partner.partnerType, ''),
      partner.isFeatured ? 'В подборке' : undefined
    ]),
    imageUrl: publicImage(partner.coverImage, partner.coverImageAlt, partner.title),
    companyName: partner.companyName,
    facts: compact([
      `Компания: ${partner.companyName}`,
      partner.partnerType ? `Тип партнёрства: ${getAdminOptionLabel(partnerTypeOptions, partner.partnerType)}` : undefined,
      partner.isFeatured ? 'Статус: В подборке' : undefined
    ]).map((entry) => {
      const [label, ...rest] = entry.split(': ');
      return {
        label,
        value: rest.join(': ')
      };
    }),
    externalUrl,
    externalUrlLabel: externalUrl ? 'Сайт партнёра' : undefined,
    sections: [
      {
        title: 'Формат партнёрства',
        items: compact([
          partner.partnerType ? `Тип: ${getAdminOptionLabel(partnerTypeOptions, partner.partnerType)}.` : undefined,
          partner.category?.name ? `Направление: ${partner.category.name}.` : undefined,
          partner.isFeatured ? 'Партнёр отмечен в подборке BARSYNERGY.' : undefined
        ])
      },
      {
        title: 'Следующий шаг',
        items: compact([
          'Используйте кнопку связи, чтобы обсудить формат сотрудничества.',
          externalUrl ? 'Сайт партнёра доступен отдельной ссылкой.' : undefined,
          'В обращении сохранится выбранная компания и направление.'
        ])
      }
    ].filter((section) => section.items.length > 0)
  };
}
