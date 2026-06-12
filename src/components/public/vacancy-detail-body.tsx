import { ArticleBodyContent } from '@/components/public/article-body-content';
import { EditorialShell } from '@/components/ui/editorial-shell';
import type { PublicContentDetailFact } from '@/modules/content/shared/detail-helpers';

type VacancyDetailBodyProps = {
  body?: string;
  facts: PublicContentDetailFact[];
  applyRail: React.ReactNode;
};

export function VacancyDetailBody({
  body,
  facts,
  applyRail,
}: VacancyDetailBodyProps) {
  const hasBody = Boolean(body?.trim());
  const structuredFacts = facts.filter((f) => !['Компания', 'Позиция', 'Зарплата', 'Обновлено', 'Город', 'График', 'Опыт'].includes(f.label));
  const hasRail = Boolean(applyRail);

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-9 md:py-12">
      <div className="container">
        <div className={`grid gap-8 ${hasRail ? 'xl:grid-cols-[1fr_minmax(18rem,0.38fr)] xl:gap-12' : ''}`}>
          <div className="min-w-0">
            {hasBody ? (
              <div className="mx-auto max-w-[70ch]">
                <ArticleBodyContent markdown={body!} />
              </div>
            ) : null}

            {structuredFacts.length > 0 ? (
              <div className="mx-auto mt-10 max-w-[70ch]">
                <div className="flex items-center gap-3 border-t border-[var(--line)] pt-7">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                    Условия вакансии
                  </h2>
                </div>
                <dl className={`mt-5 grid gap-3 ${structuredFacts.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {structuredFacts.map((fact) => (
                    <div
                      className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3.5"
                      key={fact.label}
                    >
                      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1.5 text-[15px] font-medium leading-6 text-[var(--text)]">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          {hasRail ? (
            <aside
              className="xl:self-start scroll-mt-24"
              id="vacancy-apply-rail"
            >
              <EditorialShell className="overflow-hidden">
                <div className="border-b border-[var(--line)] px-5 pb-4 pt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                    Откликнуться
                  </p>
                </div>
                {applyRail}
              </EditorialShell>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
