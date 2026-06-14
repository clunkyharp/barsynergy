import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { InlineLink } from '@/components/ui/inline-link';
import { getLegalOperatorProfile } from '@/lib/legal/legal-operator';
import type { LegalDocument } from '@/lib/legal/legal-documents';
import { DocumentHeader } from './document-header';

type LegalDraftPageProps = {
  document: LegalDocument;
};

export function LegalDraftPage({ document }: LegalDraftPageProps) {
  const { title, description, updatedAt, summary, scope, sections } = document;
  const operator = getLegalOperatorProfile();
  const relatedDocuments = [
    { href: '/legal/privacy', label: 'Политика' },
    { href: '/legal/personal-data-consent', label: 'Согласие' },
    { href: '/legal/terms', label: 'Условия' },
    { href: '/legal/cookies', label: 'Cookies' }
  ].filter((item) => item.href !== `/legal/${document.slug}`);

  return (
    <article>
      <DocumentHeader
        description={description}
        relatedDocuments={relatedDocuments}
        sections={sections}
        title={title}
        updatedAt={updatedAt}
      />

      <section className="editorial-grid border-b border-[var(--line)] py-8 md:py-10">
        <div className="container grid gap-6 md:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
            <PublicEyebrow>Коротко</PublicEyebrow>
            <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text)]">
              {summary.map((item) => (
                <li className="border-l border-[var(--accent)]/45 pl-3" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
            <PublicEyebrow>Где применяется</PublicEyebrow>
            <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text)]">
              {scope.map((item) => (
                <li className="border-l border-[var(--border-subtle)] pl-3" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
            <PublicEyebrow>Оператор данных</PublicEyebrow>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text)]">
              <p><span className="font-semibold">Статус:</span> {operator.typeLabel}</p>
              <p><span className="font-semibold">Наименование:</span> {operator.name}</p>
              <p><span className="font-semibold">Email:</span> {operator.email ?? 'данные уточняются'}</p>
              <p><span className="font-semibold">ИНН:</span> {operator.taxId ?? 'данные уточняются'}</p>
              <p><span className="font-semibold">{operator.registrationLabel}:</span> {operator.registrationId ?? 'данные уточняются'}</p>
              {operator.address ? <p><span className="font-semibold">Адрес:</span> {operator.address}</p> : null}
            </div>
            {!operator.isConfiguredForPublicForms ? (
              <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                Реквизиты оператора уточняются. Актуальные данные доступны по запросу через страницу контактов.
              </div>
            ) : null}
            <div className="mt-4 border-t border-[var(--line)] pt-4">
              <PublicBodyText size="sm">
                Если нужен рабочий комментарий по данным, заявкам или доступу, используйте страницу <InlineLink href="/contacts">контактов</InlineLink>
                {operator.email ? <> или напишите на {operator.email}</> : null}.
              </PublicBodyText>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-grid py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[15rem_minmax(0,65ch)] xl:items-start xl:justify-center">
          <aside className="hidden xl:block">
            <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">Оглавление</p>
            <nav aria-label="Оглавление документа" className="mt-4 grid gap-1">
              {sections.map((section, index) => (
                <a
                  aria-current={index === 0 ? 'location' : undefined}
                  className="rounded-[var(--radius-sm)] border border-transparent px-3 py-2 text-sm leading-5 text-[var(--muted)] transition-colors hover:border-[var(--border-default)] hover:bg-[var(--surface-wash)] hover:text-[var(--text)] aria-current:border-[var(--accent)]/35 aria-current:text-[var(--accent)]"
                  href={`#${section.id}`}
                  key={section.id}
                >
                  {section.title.replace(/^\d+\.\s*/, '')}
                </a>
              ))}
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">Связанные документы</p>
                <div className="mt-3 grid gap-1">
                  {relatedDocuments.map((item) => (
                    <InlineLink href={item.href} key={item.href}>
                      {item.label}
                    </InlineLink>
                  ))}
                </div>
              </div>
            </nav>
          </aside>

          <div className="max-w-[65ch]">
            {sections.map((section) => (
              <section className="border-t border-[var(--line)] py-7 scroll-mt-28" id={section.id} key={section.title}>
                <h2 className="text-xl font-semibold uppercase leading-7">{section.title}</h2>
                {section.paragraphs?.length ? (
                  <div className="mt-4 grid gap-4">
                    {section.paragraphs.map((paragraph) => (
                      <PublicBodyText className="text-sm leading-[1.7]" key={paragraph}>
                        {paragraph}
                      </PublicBodyText>
                    ))}
                  </div>
                ) : null}
                {section.items?.length ? (
                  <ul className="mt-4 grid gap-3 text-sm leading-[1.7] text-[var(--muted)]">
                    {section.items.map((item) => (
                      <li className="border-l border-[var(--border-subtle)] pl-4" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.note ? (
                  <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-5 py-4 text-sm leading-[1.7] text-[var(--text)]">
                    {section.note}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
