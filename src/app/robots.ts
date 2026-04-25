import type { MetadataRoute } from 'next';
import { getEnv } from '@/lib/validation/env';

export default function robots(): MetadataRoute.Robots {
  const env = getEnv();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/auth/']
    },
    sitemap: `${env.APP_URL}/sitemap.xml`
  };
}
