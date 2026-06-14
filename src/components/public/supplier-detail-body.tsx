import { ArticleBodyContent } from '@/components/public/article-body-content';
import { EditorialShell } from '@/components/ui/editorial-shell';
import type { PublicContentDetailFact } from '@/modules/content/shared/detail-helpers';

type SupplierDetailBodyProps = {
  body?: string;
  facts: PublicContentDetailFact[];
  contactRail: React.ReactNode;
};

export function SupplierDetailBody({
  body,
  facts,
  contactRail,
}: SupplierDetailBodyProps) {
  const hasBody = Boolean(body?.trim());
  const infoFacts = facts.filter((f) => !['Компания', 'Статус', 'Условия', 'Категория', 'Город', 'География', 'Контакты'].includes(f.label));
  const hasRail = Boolean(contactRail);

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-9 md:py-12">
      <div className="container">
        <div className={`grid gap-8 ${hasRail ? 'xl:grid-cols-[1fr_minmax(18rem,0.38fr)] xl:gap-12' : ''}`}>
          <div className="min-w-0">
            {hasBody ? (
              <div className="max-w-[70ch]">
                <ArticleBodyContent markdown={body!} />
              </div>
            ) : null}

            {infoFacts.length > 0 ? (
              <div className="mt-10 max-w-[70ch]">
                <h2 className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                  Информация о компании
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {infoFacts.map((fact) => (
                    <div className="border-b border-[var(--line)] pb-3" key={fact.label}>
                      <dt className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-6 text-[var(--text)]">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          {hasRail ? (
            <aside
              className="xl:self-start scroll-mt-24"
              id="supplier-contact-rail"
            >
              <EditorialShell className="overflow-hidden">
                <div className="border-b border-[var(--line)] px-5 pb-4 pt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                    Запрос поставщику
                  </p>
                </div>
                {contactRail}
              </EditorialShell>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
