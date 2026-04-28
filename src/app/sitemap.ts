import type { MetadataRoute } from 'next';
import { getEnv } from '@/lib/validation/env';

const staticRoutes = [
  '',
  '/about',
  '/education',
  '/events',
  '/articles',
  '/vacancies',
  '/suppliers',
  '/partners',
  '/general-sponsors',
  '/contacts',
  '/legal/privacy',
  '/legal/personal-data-consent',
  '/legal/terms',
  '/legal/cookies'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const env = getEnv();

  return staticRoutes.map((route) => ({
    url: `${env.APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7
  }));
}
