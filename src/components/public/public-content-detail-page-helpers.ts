import type { ReactNode } from 'react';
import type { PublicContentDetailFact, PublicContentDetailSection, PublicContentImage } from '@/modules/content/shared/detail-helpers';

type DetailLink = {
  href: string;
  label: string;
  external?: boolean;
};

type PublicContentDetailPageProps = {
  eyebrow: string;
  backHref: string;
  backLabel: string;
  title: string;
  summary: string;
  label?: string;
  meta?: string[];
  body?: string;
  imageUrl?: string | PublicContentImage;
  facts?: PublicContentDetailFact[];
  sections?: PublicContentDetailSection[];
  primaryLink?: DetailLink;
  secondaryLink?: DetailLink;
  actionsSlot?: ReactNode;
  actionsBottomSlot?: ReactNode;
};

type DetailKind = 'article' | 'event' | 'course' | 'vacancy' | 'supplier' | 'partner';

function paragraphsFromBody(body?: string) {
  if (!body) {
    return [];
  }

  return body
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeText(value: string) {
  return value
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeImage(value: string | PublicContentImage | undefined, fallbackAlt: string): PublicContentImage | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return {
      src: value,
      alt: fallbackAlt
    };
  }

  return {
    src: value.src,
    alt: value.alt.trim() || fallbackAlt
  };
}

function fallbackImage(backHref: string, fallbackAlt: string): PublicContentImage {
  if (backHref === '/events') {
    return {
      src: '/images/generated/program-events.jpg',
      alt: fallbackAlt
    };
  }

  if (backHref === '/education') {
    return {
      src: '/images/generated/program-intensive.jpg',
      alt: fallbackAlt
    };
  }

  if (backHref === '/vacancies') {
    return {
      src: '/images/home/audience-specialists-coffee.jpg',
      alt: fallbackAlt
    };
  }

  if (backHref === '/suppliers') {
    return {
      src: '/images/generated/hustle-brew-lineup-v1.png',
      alt: fallbackAlt
    };
  }

  if (backHref === '/partners') {
    return {
      src: '/images/generated/sponsorship-coffee-bar.jpg',
      alt: fallbackAlt
    };
  }

  return {
    src: '/images/generated/content-guide.jpg',
    alt: fallbackAlt
  };
}

function detailKindFromBackHref(backHref: string): DetailKind {
  if (backHref === '/events') {
    return 'event';
  }

  if (backHref === '/education') {
    return 'course';
  }

  if (backHref === '/vacancies') {
    return 'vacancy';
  }

  if (backHref === '/suppliers') {
    return 'supplier';
  }

  if (backHref === '/partners') {
    return 'partner';
  }

  return 'article';
}

function detailCopy(kind: DetailKind) {
  const copy: Record<
    DetailKind,
    {
      bodyLabel: string;
      contextLabel: string;
      fallbackBody: string;
      factsFallback: string;
      metaLabel: string;
    }
  > = {
    article: {
      bodyLabel: 'Текст материала',
      contextLabel: 'Материал',
      fallbackBody: 'Основная информация собрана в кратком описании и метках материала.',
      factsFallback: 'Источник, автор и дата указаны в описании материала.',
      metaLabel: 'Темы материала'
    },
    event: {
      bodyLabel: 'О событии',
      contextLabel: 'Событие',
      fallbackBody: 'Основная информация собрана в описании, фактах и форме записи.',
      factsFallback: 'Дата, место и формат указаны в описании события.',
      metaLabel: 'Параметры события'
    },
    course: {
      bodyLabel: 'Программа обучения',
      contextLabel: 'Программа',
      fallbackBody: 'Программа и условия собраны в фактах и блоках ниже.',
      factsFallback: 'Формат, уровень и условия указаны в описании программы.',
      metaLabel: 'Параметры программы'
    },
    vacancy: {
      bodyLabel: 'О роли',
      contextLabel: 'Вакансия',
      fallbackBody: 'Условия роли собраны в фактах и блоке отклика.',
      factsFallback: 'Компания, позиция и условия указаны в описании вакансии.',
      metaLabel: 'Параметры вакансии'
    },
    supplier: {
      bodyLabel: 'Профиль компании',
      contextLabel: 'Поставщик',
      fallbackBody: 'Профиль поставщика собран в фактах и контактном действии.',
      factsFallback: 'Категория, город и условия контакта указаны в профиле.',
      metaLabel: 'Кратко о поставщике'
    },
    partner: {
      bodyLabel: 'Формат партнёрства',
      contextLabel: 'Партнёр',
      fallbackBody: 'Формат партнёрства собран в описании и контактном действии.',
      factsFallback: 'Компания и тип партнёрства указаны в профиле.',
      metaLabel: 'Кратко о партнёре'
    }
  };

  return copy[kind];
}

export {
  type DetailLink,
  type PublicContentDetailPageProps,
  type DetailKind,
  paragraphsFromBody,
  normalizeText,
  normalizeImage,
  fallbackImage,
  detailKindFromBackHref,
  detailCopy,
};
