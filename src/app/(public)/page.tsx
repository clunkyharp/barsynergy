import type { Metadata } from 'next';
import { HomepageClient } from '@/components/public/homepage-client';
import { JsonLd } from '@/components/seo/json-ld';
import { getHomepageData } from '@/lib/public/home';
import { homepageFaqItems } from '@/lib/public/homepage-faq';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildFaqPageJsonLd } from '@/lib/public/structured-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'BARSYNERGY — вакансии, поставщики, обучение для кофеен СКФО',
  description: 'Платформа для кофейной и барной индустрии Северного Кавказа: вакансии бариста, каталог поставщиков, обучение, события и инструменты для кофеен Махачкалы, Дагестана и СКФО.',
  path: '/'
});

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(homepageFaqItems)} />
      <HomepageClient data={data} />
    </>
  );
}
