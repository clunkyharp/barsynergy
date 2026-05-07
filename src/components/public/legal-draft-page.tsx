import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { InlineLink } from '@/components/ui/inline-link';
import { getLegalOperatorProfile } from '@/lib/legal/legal-operator';
import type { LegalDocument } from '@/lib/legal/legal-documents';

type LegalDraftPageProps = {
  document: LegalDocument;
};

export function LegalDraftPage({ document }: LegalDraftPageProps) {
  const { title, description, updatedAt, scope, sections } = document;
  const operator = getLegalOperatorProfile();

  return (
    <article>
      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_0.72fr_0.56fr]">
          <div className="min-w-0">
            <PublicEyebrow>Юридический раздел</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3" size="legal">
              {title}
            </PublicDisplayTitle>
          </div>
          <div className="min-w-0 xl:border-l xl:border-black/20 xl:pl-5">
            <PublicBodyText className="max-w-[19rem] sm:max-w-full md:max-w-2xl" size="md" tone="default">
              {description}
            </PublicBodyText>
            <PublicBodyText className="mt-5 max-w-2xl" size="sm">
              Актуальная редакция: {updatedAt}. Документ описывает текущую логику сайта и должен обновляться вместе с изменением форм, кабинетов и пользовательских сценариев.
            </PublicBodyText>
          </div>
          <div className="grid gap-5 rounded-[28px] border border-black/12 bg-black/[0.03] p-6">
            <div>
              <PublicEyebrow>Где применяется</PublicEyebrow>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--text)]">
                {scope.map((item) => (
                  <li className="border-l border-black/16 pl-3" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-black/10 pt-5">
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
                <div className="mt-4 rounded-[20px] border border-[var(--warning-border)] bg-[var(--warning-surface)] px-4 py-3 text-sm leading-6 text-[var(--text)]">
                  Реквизиты оператора ещё не заполнены полностью. До публичного запуска сбора персональных данных этот блок должен быть доведён до финальной версии.
                </div>
              ) : null}
            </div>
            <div className="border-t border-black/10 pt-5">
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
        <div className="container max-w-4xl">
          {sections.map((section) => (
            <section className="border-t border-black/20 py-7" id={section.id} key={section.title}>
              <h2 className="text-xl font-semibold uppercase leading-7">{section.title}</h2>
              {section.paragraphs?.length ? (
                <div className="mt-4 grid gap-4">
                  {section.paragraphs.map((paragraph) => (
                    <PublicBodyText key={paragraph} size="sm">
                      {paragraph}
                    </PublicBodyText>
                  ))}
                </div>
              ) : null}
              {section.items?.length ? (
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--muted)]">
                  {section.items.map((item) => (
                    <li className="border-l border-black/20 pl-4" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.note ? (
                <div className="mt-5 rounded-[22px] border border-black/10 bg-black/[0.03] px-5 py-4 text-sm leading-7 text-[var(--text)]">
                  {section.note}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </section>
    </article>
  );
}
