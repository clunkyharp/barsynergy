import { displayFont } from '@/lib/fonts';

type LegalDraftPageProps = {
  title: string;
  description: string;
  sections: {
    title: string;
    items: string[];
  }[];
};

export function LegalDraftPage({ title, description, sections }: LegalDraftPageProps) {
  return (
    <article>
      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Юридический раздел</p>
            <h1 className={`${displayFont.className} display-tight mt-3 max-w-3xl break-words text-[34px] sm:text-[42px] md:text-[44px]`}>
              {title}
            </h1>
          </div>
          <div className="min-w-0 border-l border-black/20 pl-5">
            <p className="max-w-[19rem] text-base leading-7 text-[var(--muted)] sm:max-w-full md:max-w-2xl">{description}</p>
            <p className="mt-6 max-w-2xl text-sm font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
              Актуальная редакция применяется к публичным разделам и формам сайта.
            </p>
          </div>
        </div>
      </section>

      <section className="editorial-grid py-10 md:py-14">
        <div className="container max-w-4xl">
          {sections.map((section) => (
            <section className="border-t border-black/20 py-7" key={section.title}>
              <h2 className="text-xl font-semibold uppercase leading-7">{section.title}</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--muted)]">
                {section.items.map((item) => (
                  <li className="border-l border-black/20 pl-4" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </article>
  );
}
