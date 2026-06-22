import type { JsonLdValue } from '@/components/seo/json-ld';
import type { PublicContentDetail } from '@/modules/content/shared/detail-helpers';
import type { PublicMasterDetail } from '@/lib/public/content/masters';
import { getEnv } from '@/lib/validation/env';

const siteName = 'BARSYNERGY';
const language = 'ru-RU';

type BreadcrumbItem = {
  name: string;
  path: string;
};

type PublicContentJsonLdKind = 'article' | 'event' | 'course' | 'vacancy' | 'organization';

function siteUrl() {
  return getEnv().APP_URL.replace(/\/+$/, '');
}

function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${siteUrl()}${normalizedPath}`;
}

function organizationReference(): JsonLdValue {
  return {
    '@type': 'Organization',
    name: siteName,
    url: siteUrl()
  };
}

function factValue(detail: PublicContentDetail, label: string) {
  return detail.facts.find((fact) => fact.label === label)?.value;
}

function imageUrl(detail: PublicContentDetail) {
  return detail.imageUrl?.src ? absoluteUrl(detail.imageUrl.src) : undefined;
}

export function buildSiteJsonLd(): JsonLdValue[] {
  const url = siteUrl();

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url,
      logo: absoluteUrl('/brand/barsynergy-lockup.svg'),
      sameAs: [
        'https://t.me/barsynergy',
        'https://www.instagram.com/barsynergy'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url,
      inLanguage: language,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
  ];
}

export function buildFaqPageJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>
): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

export function buildWebApplicationJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RUB'
    },
    inLanguage: language
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function buildStaticPageBreadcrumbJsonLd(path: string, name: string): JsonLdValue {
  return buildBreadcrumbJsonLd([
    { name: 'Главная', path: '/' },
    { name, path }
  ]);
}

export function buildPublicContentJsonLd({
  detail,
  path,
  kind
}: {
  detail: PublicContentDetail;
  path: string;
  kind: PublicContentJsonLdKind;
}): JsonLdValue {
  const url = absoluteUrl(path);
  const image = imageUrl(detail);
  const common = {
    name: detail.title,
    description: detail.summary,
    url,
    image,
    inLanguage: language,
    mainEntityOfPage: url
  };

  switch (kind) {
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: detail.title,
        ...common,
        datePublished: detail.publishedAtIso,
        dateModified: detail.updatedAtIso,
        publisher: organizationReference()
      };
    case 'event': {
      const cityName = detail.cityName ?? factValue(detail, 'Город');
      const locationName = detail.locationName ?? factValue(detail, 'Место');
      const address = detail.address ?? factValue(detail, 'Адрес');
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        ...common,
        startDate: detail.startsAtIso,
        endDate: detail.endsAtIso,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        organizer: organizationReference(),
        location:
          cityName || locationName || address
            ? { '@type': 'Place', name: locationName ?? cityName, address: { '@type': 'PostalAddress', streetAddress: address, addressLocality: cityName, addressCountry: 'RU' } }
            : undefined
      };
    }
    case 'course':
      return { '@context': 'https://schema.org', '@type': 'Course', ...common, provider: organizationReference() };
    case 'vacancy':
      return {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: detail.title,
        description: detail.summary,
        url,
        datePosted: detail.publishedAtIso,
        hiringOrganization: { '@type': 'Organization', name: detail.companyName ?? siteName },
        jobLocation: detail.cityName
          ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: detail.cityName, addressCountry: 'RU' } }
          : undefined
      };
    default:
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: detail.companyName ?? detail.title,
        description: detail.summary,
        url: detail.externalUrl ?? url,
        image,
        sameAs: detail.externalUrl,
        mainEntityOfPage: url
      };
  }
}

export function buildMasterJsonLd(detail: PublicMasterDetail, path: string): JsonLdValue {
  const url = absoluteUrl(path);
  const image = imageUrl(detail);
  const displayName = detail.companyName ?? factValue(detail, 'Профиль') ?? detail.title;

  if (detail.entityType === 'BUSINESS') {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: displayName,
      description: detail.summary,
      url,
      image,
      address: detail.cityName
        ? {
            '@type': 'PostalAddress',
            addressLocality: detail.cityName,
            addressCountry: 'RU'
          }
        : undefined,
      areaServed: detail.serviceArea,
      priceRange: detail.rateLabel,
      mainEntityOfPage: url
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: displayName,
    description: detail.summary,
    url,
    image,
    jobTitle: detail.label ?? 'Мастер',
    knowsAbout: detail.specializations,
    workLocation: detail.cityName
      ? {
          '@type': 'Place',
          name: detail.cityName
        }
      : undefined,
    mainEntityOfPage: url
  };
}
