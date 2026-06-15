import type { Metadata } from 'next';
import { PageHero } from '@/components/public/page-hero';
import { MasterSubmissionForm } from './master-submission-form';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Предложить услуги',
  description: 'Заполните форму, чтобы добавить свои услуги в каталог специалистов BARSYNERGY.',
  path: '/specialists/svc/new',
});

export default function MasterSubmissionPage() {
  return (
    <>
      <PageHero
        title="Предложить услуги"
        subtitle="Заполните форму — после модерации карточка появится в каталоге специалистов."
        tone="graphite"
      />
      <section className="public-section">
        <div className="public-section-inner">
          <div className="mx-auto max-w-2xl">
            <MasterSubmissionForm />
          </div>
        </div>
      </section>
    </>
  );
}
