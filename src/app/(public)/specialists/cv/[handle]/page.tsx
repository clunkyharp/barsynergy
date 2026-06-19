import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedResumeDetail } from '@/lib/public/content';
import { buildMissingPublicContentMetadata } from '@/lib/public/metadata';
import { getEnv } from '@/lib/validation/env';
import { ResumeDetailView } from './resume-detail-view';

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const resume = await getPublishedResumeDetail(handle);

  if (!resume) {
    return buildMissingPublicContentMetadata({
      title: 'Резюме не найдено',
      description: 'Резюме удалено или скрыто.'
    });
  }

  const env = getEnv();

  return {
    title: `${resume.fullName ?? 'Специалист'} — резюме | BARSYNERGY`,
    description: resume.headline ?? resume.bio ?? resume.profession ?? 'Профиль специалиста барной индустрии.',
    alternates: { canonical: `${env.APP_URL}/specialists/cv/${handle}` },
  };
}

export default async function ResumeDetailPage({ params }: Props) {
  const { handle } = await params;
  const resume = await getPublishedResumeDetail(handle);

  if (!resume) {
    notFound();
  }

  return <ResumeDetailView resume={resume} />;
}
