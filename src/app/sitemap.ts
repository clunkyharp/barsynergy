import type { MetadataRoute } from 'next';
import { ContentStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';

export const dynamic = 'force-dynamic';

type SitemapRecord = {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/education', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/events', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/articles', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/vacancies', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/business', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/consulting', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/suppliers', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/partners', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/general-sponsors', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/tools/cost-calculator', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contacts', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/legal/personal-data-consent', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/legal/terms', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/legal/cookies', changeFrequency: 'yearly', priority: 0.4 }
];

const sitemapRecordSelect = {
  slug: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true
} satisfies Record<keyof SitemapRecord, true>;

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function routeUrl(baseUrl: string, path: string) {
  return path === '/' ? baseUrl : `${baseUrl}${path}`;
}

function recordLastModified(record: SitemapRecord) {
  return record.updatedAt ?? record.publishedAt ?? record.createdAt;
}

function detailEntries({
  baseUrl,
  basePath,
  records
}: {
  baseUrl: string;
  basePath: string;
  records: SitemapRecord[];
}): MetadataRoute.Sitemap {
  return records.map((record) => ({
    url: `${baseUrl}${basePath}/${record.slug}`,
    lastModified: recordLastModified(record),
    changeFrequency: 'monthly',
    priority: 0.6
  }));
}

async function getPublishedDetailRoutes(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const [articles, events, courses, vacancies, suppliers, partners] = await Promise.all([
      prisma.article.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        select: sitemapRecordSelect
      }),
      prisma.event.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        select: sitemapRecordSelect
      }),
      prisma.course.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        select: sitemapRecordSelect
      }),
      prisma.vacancy.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        select: sitemapRecordSelect
      }),
      prisma.supplier.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        select: sitemapRecordSelect
      }),
      prisma.partner.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { updatedAt: 'desc' },
        select: sitemapRecordSelect
      })
    ]);

    return [
      ...detailEntries({ baseUrl, basePath: '/articles', records: articles }),
      ...detailEntries({ baseUrl, basePath: '/events', records: events }),
      ...detailEntries({ baseUrl, basePath: '/education', records: courses }),
      ...detailEntries({ baseUrl, basePath: '/vacancies', records: vacancies }),
      ...detailEntries({ baseUrl, basePath: '/suppliers', records: suppliers }),
      ...detailEntries({ baseUrl, basePath: '/partners', records: partners })
    ];
  } catch (error) {
    console.warn('Sitemap detail routes were skipped because published content could not be loaded.', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = normalizeBaseUrl(getEnv().APP_URL);
  const detailRoutes = await getPublishedDetailRoutes(baseUrl);

  return [
    ...staticRoutes.map((route) => ({
      url: routeUrl(baseUrl, route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority
    })),
    ...detailRoutes
  ];
}
