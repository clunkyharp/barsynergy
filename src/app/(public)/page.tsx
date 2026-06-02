import type { Metadata } from 'next';
import { HomepageClient } from '@/components/public/homepage-client';
import { getHomepageData } from '@/lib/public/home';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'BARSYNERGY',
  description: 'Платформа для барной индустрии СКФО: обучение, события, статьи, вакансии, поставщики и партнёрские запросы.',
  path: '/'
});

export default async function HomePage() {
  const data = await getHomepageData();

  return <HomepageClient data={data} />;
}
