import { ArticleBodyContent } from '@/components/public/article-body-content';
import { EditorialShell } from '@/components/ui/editorial-shell';
import { DirectContactLinks } from '@/components/public/direct-contact-links';

type VacancyDetailBodyProps = {
  body?: string;
  applyRail: React.ReactNode;
  contactDirect?: {
    telegram?: string;
    phone?: string;
    email?: string;
  };
};

export function VacancyDetailBody({
  body,
  applyRail,
  contactDirect,
}: VacancyDetailBodyProps) {
  const hasBody = Boolean(body?.trim());
  const hasDirectContact = Boolean(contactDirect?.telegram || contactDirect?.phone || contactDirect?.email);
  const hasRail = Boolean(applyRail) || hasDirectContact;

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
          </div>

          {hasRail ? (
            <aside
              className="xl:self-start scroll-mt-24"
              id="vacancy-apply-rail"
            >
              <EditorialShell className="overflow-hidden">
                <div className="border-b border-[var(--line)] px-5 pb-4 pt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                    {hasDirectContact ? 'Связаться напрямую' : 'Откликнуться'}
                  </p>
                </div>
                {hasDirectContact ? (
                  <div className="px-5 pb-4 pt-4">
                    <DirectContactLinks
                      telegram={contactDirect!.telegram}
                      phone={contactDirect!.phone}
                      email={contactDirect!.email}
                    />
                    {applyRail ? (
                      <>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--line)]" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-[var(--surface)] px-3 text-[10px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
                              Или через форму
                            </span>
                          </div>
                        </div>
                        {applyRail}
                      </>
                    ) : null}
                  </div>
                ) : (
                  applyRail
                )}
              </EditorialShell>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
