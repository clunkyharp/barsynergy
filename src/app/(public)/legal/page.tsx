import type { Metadata } from 'next';
import { PublicBodyText, PublicBreadcrumbs, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { InlineLink } from '@/components/ui/inline-link';
import { getCookiesDocument, getPersonalDataConsentDocument, getPrivacyDocument, getTermsDocument } from '@/lib/legal/legal-documents';

const legalDocuments = [
  getPrivacyDocument(),
  getPersonalDataConsentDocument(),
  getTermsDocument(),
  getCookiesDocument()
];

export const metadata: Metadata = {
  title: 'Юридический раздел | BARSYNERGY',
  description: 'Политика обработки персональных данных, согласие, условия использования и информация о cookies.',
  alternates: {
    canonical: '/legal'
  },
  openGraph: {
    title: 'Юридический раздел | BARSYNERGY',
    description: 'Политика обработки персональных данных, согласие, условия использования и информация о cookies.',
    url: '/legal'
  }
};

export default function LegalIndexPage() {
  return (
    <article>
      <section className="border-b border-[var(--line)]">
        <div className="container">
          <div className="pt-4 pb-6 md:pb-8">
            <PublicBreadcrumbs
              current="Юридический раздел"
              items={[{ href: '/', label: 'Главная' }]}
            />
            <div className="mt-3">
              <PublicDisplayTitle as="h1" className="mt-1" size="legal">
                Юридический раздел
              </PublicDisplayTitle>
              <PublicBodyText className="mt-3 max-w-2xl" size="md">
                Документы, которые регулируют работу платформы BARSYNERGY, обработку данных и правила
                использования сервиса.
              </PublicBodyText>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-grid py-10 md:py-14">
        <div className="container grid gap-6 md:grid-cols-2">
          {legalDocuments.map((doc) => (
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-6 transition-colors hover:border-[var(--accent)]/35"
              key={doc.slug}
            >
              <PublicEyebrow>{doc.scope.join(' · ')}</PublicEyebrow>
              <h2 className="mt-3 text-lg font-semibold leading-7">
                <InlineLink href={`/legal/${doc.slug}`}>{doc.title}</InlineLink>
              </h2>
              <p className="mt-2 text-sm leading-[1.7] text-[var(--muted)]">{doc.description}</p>
              <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                Актуальная редакция: {doc.updatedAt}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
