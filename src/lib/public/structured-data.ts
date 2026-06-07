import type { JsonLdValue } from '@/components/seo/json-ld';
import type { PublicContentDetail } from '@/modules/content/shared/detail-helpers';
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
      logo: absoluteUrl('/brand/barsynergy-lockup.svg')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url,
      inLanguage: language
    }
  ];
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

  if (kind === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: detail.title,
      ...common,
      datePublished: detail.publishedAtIso,
      dateModified: detail.updatedAtIso,
      publisher: organizationReference()
    };
  }

  if (kind === 'event') {
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
          ? {
              '@type': 'Place',
              name: locationName ?? cityName,
              address: {
                '@type': 'PostalAddress',
                streetAddress: address,
                addressLocality: cityName,
                addressCountry: 'RU'
              }
            }
          : undefined
    };
  }

  if (kind === 'course') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      ...common,
      provider: organizationReference()
    };
  }

  if (kind === 'vacancy') {
    return {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: detail.title,
      description: detail.summary,
      url,
      datePosted: detail.publishedAtIso,
      hiringOrganization: {
        '@type': 'Organization',
        name: detail.companyName ?? siteName
      },
      jobLocation: detail.cityName
        ? {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: detail.cityName,
              addressCountry: 'RU'
            }
          }
        : undefined
    };
  }

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
