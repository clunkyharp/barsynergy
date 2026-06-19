import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedMasterDetail } from '@/lib/public/content';
import { buildMissingPublicContentMetadata } from '@/lib/public/metadata';
import { getEnv } from '@/lib/validation/env';
import { MasterDetailView } from './master-detail-view';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const master = await getPublishedMasterDetail(slug);

  if (!master) {
    return buildMissingPublicContentMetadata({
      title: 'Услуга не найдена',
      description: 'Карточка специалиста удалена или ещё не опубликована.'
    });
  }

  const env = getEnv();

  return {
    title: `${master.title} — услуги | BARSYNERGY`,
    description: master.summary,
    alternates: { canonical: `${env.APP_URL}/specialists/svc/${slug}` },
  };
}

export default async function MasterDetailPage({ params }: Props) {
  const { slug } = await params;
  const master = await getPublishedMasterDetail(slug);

  if (!master) {
    notFound();
  }

  return <MasterDetailView master={master} />;
}
