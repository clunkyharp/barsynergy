import { PublicBodyText, PublicBreadcrumbs, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { InlineLink } from '@/components/ui/inline-link';
import { getLegalOperatorProfile } from '@/lib/legal/legal-operator';
import type { LegalDocument } from '@/lib/legal/legal-documents';

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
      <section className="editorial-grid border-b border-[var(--line)] pt-3 pb-10 md:pb-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_0.72fr_0.56fr]">
          <div className="min-w-0">
            <PublicBreadcrumbs current={title} />
            <PublicEyebrow className="mt-4">Юридический раздел</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3" size="legal">
              {title}
            </PublicDisplayTitle>
          </div>
          <div className="min-w-0 xl:border-l xl:border-[var(--line)] xl:pl-5">
            <PublicBodyText className="max-w-[19rem] sm:max-w-full md:max-w-2xl" size="md" tone="default">
              {description}
            </PublicBodyText>
            <PublicBodyText className="mt-5 max-w-2xl" size="sm">
              Актуальная редакция: {updatedAt}. Документ описывает текущую логику сайта и должен обновляться вместе с изменением форм, кабинетов и пользовательских сценариев.
            </PublicBodyText>
            <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
              <PublicEyebrow>Коротко</PublicEyebrow>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text)]">
                {summary.map((item) => (
                  <li className="border-l border-[var(--accent)]/45 pl-3" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-6">
            <div>
              <PublicEyebrow>Где применяется</PublicEyebrow>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text)]">
                {scope.map((item) => (
                  <li className="border-l border-[var(--border-subtle)] pl-3" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-[var(--line)] pt-5">
              <PublicEyebrow>Оператор данных</PublicEyebrow>
              <div className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text)]">
                <p>
                  <span className="font-semibold">Статус:</span> {operator.typeLabel}
                </p>
                <p>
                  <span className="font-semibold">Наименование:</span> {operator.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {operator.email ?? 'не указан'}
                </p>
                <p>
                  <span className="font-semibold">ИНН:</span> {operator.taxId ?? 'не указан'}
                </p>
                <p>
                  <span className="font-semibold">{operator.registrationLabel}:</span> {operator.registrationId ?? 'не указан'}
                </p>
                {operator.address ? (
                  <p>
                    <span className="font-semibold">Адрес:</span> {operator.address}
                  </p>
                ) : null}
              </div>
              {!operator.isConfiguredForPublicForms ? (
                <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                  Реквизиты оператора уточняются. Актуальные данные доступны по запросу через страницу контактов.
                </div>
              ) : null}
            </div>
            <div className="border-t border-[var(--line)] pt-5">
              <PublicEyebrow>По вопросам</PublicEyebrow>
              <PublicBodyText className="mt-3" size="sm">
                Если нужен рабочий комментарий по данным, заявкам или доступу, используйте страницу <InlineLink href="/contacts">контактов</InlineLink>
                {operator.email ? <> или напишите на {operator.email}</> : null}.
              </PublicBodyText>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-grid py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[15rem_minmax(0,65ch)] xl:items-start xl:justify-center">
          <aside className="legal-toc hidden xl:block xl:sticky xl:top-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Оглавление</p>
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
            </nav>
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Связанные документы</p>
              <div className="mt-3 grid gap-1">
                {relatedDocuments.map((item) => (
                  <InlineLink href={item.href} key={item.href}>
                    {item.label}
                  </InlineLink>
                ))}
              </div>
            </div>
          </aside>

          <div className="legal-document-body max-w-[65ch]">
            {sections.map((section) => (
              <section className="border-t border-[var(--line)] py-7 scroll-mt-28" id={section.id} key={section.title}>
                <h2 className="text-xl font-semibold uppercase leading-7">{section.title}</h2>
                {section.paragraphs?.length ? (
                  <div className="mt-4 grid gap-4">
                    {section.paragraphs.map((paragraph) => (
                      <PublicBodyText className="legal-document-text" key={paragraph} size="sm">
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
