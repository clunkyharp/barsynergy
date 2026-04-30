import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';

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
            <PublicEyebrow>Юридический раздел</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3" size="legal">
              {title}
            </PublicDisplayTitle>
          </div>
          <div className="min-w-0 border-l border-black/20 pl-5">
            <PublicBodyText className="max-w-[19rem] sm:max-w-full md:max-w-2xl" size="md">
              {description}
            </PublicBodyText>
            <PublicEyebrow className="mt-6 max-w-2xl">
              Актуальная редакция применяется к публичным разделам и формам сайта.
            </PublicEyebrow>
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
